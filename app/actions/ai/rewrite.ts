"use server";

import Anthropic from "@anthropic-ai/sdk";

export async function rewriteText(text: string): Promise<{ success: boolean; rewrittenText?: string; message?: string }> {
  try {
    if (!text || text.trim().length === 0) {
      return { success: false, message: "No text provided to rewrite" };
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      console.error("ANTHROPIC_API_KEY is not configured");
      return { success: false, message: "AI service is not configured" };
    }

    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `Please rewrite the following feedback comment to make it more professional, constructive, and well-structured while maintaining the original meaning and intent. Keep it concise and clear:\n\n"${text}"\n\nProvide only the rewritten text without any explanations or additional commentary.`
        }
      ],
    });

    const rewrittenText = message.content[0].type === "text" ? message.content[0].text : "";

    if (!rewrittenText) {
      return { success: false, message: "Failed to generate rewritten text" };
    }

    return { success: true, rewrittenText: rewrittenText.trim() };
  } catch (error) {
    console.error("Error rewriting text with AI:", error);
    return { success: false, message: "An error occurred while rewriting the text" };
  }
}
