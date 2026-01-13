"use server";

import Anthropic from "@anthropic-ai/sdk";
import { DotCategory } from "@/app/actions/api/types";

export interface SelectedDotAI {
  label_id: number;
  label: string;
  dot_type: "thumbs_up" | "ok" | "loop";
  categoryName: string;
}

export async function selectDotsByAI(
  feedbackText: string,
  allDots: DotCategory[]
): Promise<{ success: boolean; selectedDots?: SelectedDotAI[]; message?: string }> {
  try {
    if (!feedbackText || feedbackText.trim().length === 0) {
      return { success: false, message: "No feedback text provided" };
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      console.error("ANTHROPIC_API_KEY is not configured");
      return { success: false, message: "AI service is not configured" };
    }

    // Format the dots data for the AI
    const dotsContext = JSON.stringify(allDots, null, 2);

    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: `You are an intelligent assistant for an employee feedback tool. Your job is to analyze written feedback text and categorize it into specific behavioral attributes called "Dots."

Instructions:
1. Analyze the Input: Read the user's feedback text carefully. Identify specific behaviors, actions, or attitudes mentioned.

2. Map to Dots: Select up to 5 specific labels from the provided list that best match the behaviors described in the text.

3. Determine Sentiment: For each selected Dot, assign one of the following ratings based on the context of the feedback:
   - "thumbs_up": The behavior was positive, exemplary, or a strength.
   - "ok": The behavior met expectations, was neutral, or the feedback is merely descriptive without strong praise or criticism.
   - "loop": The behavior needs improvement, was a failure, or the feedback is constructive criticism/negative.

Here is the available Dots data structure:
${dotsContext}

Feedback text to analyze:
"${feedbackText}"

Respond ONLY with a valid JSON array in this exact format, no additional text or explanation:
[
  {
    "label_id": 1,
    "label": "Developed others",
    "dot_type": "thumbs_up",
    "categoryName": "Being able to lead"
  }
]

If no relevant dots can be found, return an empty array: []`
        }
      ],
    });

    const responseText = message.content[0].type === "text" ? message.content[0].text : "";

    if (!responseText) {
      return { success: false, message: "Failed to analyze feedback" };
    }

    // Parse the JSON response
    let selectedDots: SelectedDotAI[];
    try {
      // Extract JSON from the response (in case Claude adds any extra text)
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        console.error("No JSON array found in response:", responseText);
        return { success: false, message: "Failed to parse AI response" };
      }
      
      selectedDots = JSON.parse(jsonMatch[0]);
      
      // Validate the response
      if (!Array.isArray(selectedDots)) {
        return { success: false, message: "Invalid response format from AI" };
      }

      // Validate each dot
      for (const dot of selectedDots) {
        if (!dot.label_id || !dot.label || !dot.dot_type || !dot.categoryName) {
          console.error("Invalid dot structure:", dot);
          return { success: false, message: "Invalid dot structure in AI response" };
        }
        
        // Validate dot_type
        if (!["thumbs_up", "ok", "loop"].includes(dot.dot_type)) {
          console.error("Invalid dot_type:", dot.dot_type);
          return { success: false, message: "Invalid dot type in AI response" };
        }
      }

      // Limit to 5 dots
      selectedDots = selectedDots.slice(0, 5);

    } catch (error) {
      console.error("Error parsing AI response:", error, "Response:", responseText);
      return { success: false, message: "Failed to parse AI response" };
    }

    return { success: true, selectedDots };
  } catch (error) {
    console.error("Error selecting dots with AI:", error);
    return { success: false, message: "An error occurred while analyzing the feedback" };
  }
}
