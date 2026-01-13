"use client";

import React, { useEffect, useRef, useState, useTransition } from "react";
import {
  revalidateUserDotsSummary,
  revalidateUserGivenDots,
} from "@/app/actions/revalidate";
import {
  AttributeContentLoop,
  AttributeContentOK,
  AttributeContentThumbsUp,
} from "@/components/CommonSVGs/AboutSVGs";
import { SelectedDot } from "./Wrapper";
import { giveDots, editGivenDot } from "@/app/actions/dots/give-edit-dots-api";
import ErrorPopup from "../ErrorPopup";
import scrollToTop from "@/utils/scrollToTop";
import { rewriteText } from "@/app/actions/ai/rewrite";
import { selectDotsByAI } from "@/app/actions/ai/select-dots";
import { DotCategory as DotCategoryType } from "@/app/actions/api/types";

const DotTextField = ({
  token,
  selectedUsers,
  setSelectedUsers,
  selectedDots,
  setSelectedDots,
  dotId,
  type = "give",
  setHasSubmitted,
  initialComment = "",
  originalSelectedDots = [],
  showTextFieldForTouchscreen,
  setShowTextFieldForTouchscreen,
  allDots,
}: {
  allDots: DotCategoryType[];
  token?: string;
  selectedUsers: number[];
  setSelectedUsers: React.Dispatch<React.SetStateAction<number[]>>;
  selectedDots: SelectedDot[];
  setSelectedDots: React.Dispatch<React.SetStateAction<SelectedDot[]>>;
  dotId?: string;
  type?: "give" | "edit";
  setHasSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
  initialComment?: string;
  originalSelectedDots?: SelectedDot[];
  showTextFieldForTouchscreen: boolean;
  setShowTextFieldForTouchscreen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const removeSelectedDot = (index: number) => {
    setSelectedDots((prev) => prev.filter((_, i) => i !== index));
  };

  const [feedBackWordCount, setFeedBackWordCount] = useState(
    initialComment ? initialComment.split(" ").filter((word) => word).length : 0
  );

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isRewriting, setIsRewriting] = useState(false);
  const [isSelectingDots, setIsSelectingDots] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const textAreaTouchRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async () => {
    setErrorMsg(null);
    const comment = textAreaRef.current?.value || textAreaTouchRef.current?.value || "";
    const details = selectedDots.map((dot) => ({
      label_id: dot.label_id,
      dot_type_name: dot.dot_type,
    }));

    // run via transition so UI stays responsive
    startTransition(async () => {
      try {
        if (type === "edit") {
          if (!dotId) {
            setErrorMsg("Missing dotId for edit.");
            console.error("Missing dotId for edit.");
            return;
          }
          // Snapshot previous (server/original) state for Undo
          sessionStorage.setItem(
            "previouslyEditedDotUndoData",
            JSON.stringify({
              dotId,
              comment: initialComment,
              selectedDots: originalSelectedDots.map((dot) => ({
                label_id: dot.label_id,
                label: dot.label,
                dot_type: dot.dot_type,
                categoryName: dot.categoryName,
              })),
            })
          );
          const payload = {
            comment,
            // details,
          };
          const res = await editGivenDot(Number(dotId), payload, token);
          if (!res.success) {
            // On failure revert snapshot (user may retry)
            setErrorMsg(
              res.message || "There was a problem submitting your dots."
            );
            console.error("Error editing dot:", res);
            return;
          }
          // Persist new edited state (used for reopening edit screen)
          sessionStorage.setItem(
            "previouslyEditedDotData",
            JSON.stringify({
              dotId,
              comment,
              selectedDots: selectedDots.map((dot) => ({
                label_id: dot.label_id,
                label: dot.label,
                dot_type: dot.dot_type,
                categoryName: dot.categoryName,
              })),
            })
          );
        } else {
          const res = await giveDots(
            { receiver_ids: selectedUsers, comment, details },
            token
          );
          if (!res.success) {
            setErrorMsg(
              res.message || "There was a problem submitting your dots."
            );
            console.error("Error giving dots:", res);
            return;
          }
        }

        // In case you still need them here (server actions already revalidate)
        await revalidateUserGivenDots();
        await revalidateUserDotsSummary();
        setHasSubmitted(true);
        if (type === "give") {
          setSelectedDots([]);
          if (textAreaRef.current) {
            textAreaRef.current.value = "";
            setFeedBackWordCount(0);
          }
          setSelectedUsers([]);
          sessionStorage.removeItem("selectedUsers");
        }
      } catch (error) {
        console.error("Error giving/editing dots:", error);
        setErrorMsg("Unexpected error submitting your dots.");
      }
    });
  };

  const disabled =
    isPending ||
    selectedDots.length === 0 ||
    feedBackWordCount < 5 ||
    (type === "give" && selectedUsers.length === 0);

  const handleRewriteByAI = async () => {
    const currentText = textAreaRef.current?.value || textAreaTouchRef.current?.value || "";
    
    if (!currentText.trim()) {
      setErrorMsg("Please enter some text to rewrite");
      return;
    }

    setIsRewriting(true);
    setErrorMsg(null);

    try {
      const result = await rewriteText(currentText);
      
      if (result.success && result.rewrittenText) {
        if (textAreaRef.current) {
          textAreaRef.current.value = result.rewrittenText;
        }
        if (textAreaTouchRef.current) {
          textAreaTouchRef.current.value = result.rewrittenText;
        }
        setFeedBackWordCount(
          result.rewrittenText.split(" ").filter((word) => word).length
        );
      } else {
        setErrorMsg(result.message || "Failed to rewrite text");
      }
    } catch (error) {
      console.error("Error rewriting text:", error);
      setErrorMsg("An error occurred while rewriting the text");
    } finally {
      setIsRewriting(false);
    }
  };

  const handleSelectDotsByAI = async () => {
    const currentText = textAreaRef.current?.value || textAreaTouchRef.current?.value || "";
    
    if (!currentText.trim()) {
      setErrorMsg("Please enter feedback text first");
      return;
    }

    setIsSelectingDots(true);
    setErrorMsg(null);

    try {
      const result = await selectDotsByAI(currentText, allDots);
      
      if (result.success && result.selectedDots) {
        // Replace existing selected dots with AI suggestions
        setSelectedDots(result.selectedDots);
      } else {
        setErrorMsg(result.message || "Failed to select dots");
      }
    } catch (error) {
      console.error("Error selecting dots with AI:", error);
      setErrorMsg("An error occurred while selecting dots");
    } finally {
      setIsSelectingDots(false);
    }
  };

  useEffect(() => {
    if (showTextFieldForTouchscreen && selectedDots.length === 0) {
      setShowTextFieldForTouchscreen(false);
    }
  }, [showTextFieldForTouchscreen, selectedDots.length, setShowTextFieldForTouchscreen]);


  return (
    <>
      {/* Touchscreen buttons - slides left when hidden */}
      <div className={`hidden max-sm:flex gap-2 fixed bottom-0 bg-off-white w-full pb-4 justify-center
        transition-transform duration-300 ease-in-out
        ${showTextFieldForTouchscreen ? '-translate-x-full' : 'translate-x-0'}
      `}
        data-testid="dot-text-field-root-touchscreen-buttons"
      >
        <button
          className="hidden max-sm:block w-[173.5px] h-9 py-1.5 px-8
            text-light-black font-inter text-base bg-background-grey rounded-lg
            font-medium leading-[150%]
            "
          onClick={scrollToTop}
        >
          Back to top
        </button>
        <button
          className="w-full bg-light-black 
              text-off-white rounded-lg hover:bg-dark-black disabled:bg-gray-400
              max-sm:h-9 max-sm:w-[173.5px] max-sm:rounded-lg
              font-medium text-base desktop:text-lg leading-[150%]"
          onClick={() => setShowTextFieldForTouchscreen(true)}
          disabled={selectedDots.length === 0}
        >
          Next
        </button>
      </div>

      {/* Touchscreen text field - slides in from right */}
      <div
        data-testid="dot-text-field-root-touchscreens"
        id="text-field-component"
        className={`px-10 desktop:px-[70px] py-[22px] desktop:pb-[30px] fixed bottom-0 bg-[#F9FBFD] w-full
      max-sm:h-full max-sm:pt-[50px] max-sm:px-[17px]
      transition-transform duration-300 ease-in-out
      ${showTextFieldForTouchscreen ? 'translate-x-0' : 'translate-x-full'}
      `}
        style={{ boxShadow: "0px -4px 6px rgba(0, 0, 0, 0.1)" }}
      >
        <div className="hidden max-sm:block text-[14px] pt-4 text-dark-grey leading-[125%] font-medium pb-1.5 border-b border-light-grey mb-3.5 px-0.5">
          Dot Summary
        </div>
        {/* Selected dots */}
        {selectedDots.length > 0 && (
          <div className="selected-dots flex gap-3 max-sm:gap-2 mb-5 max-sm:mb-7 flex-wrap">
            {selectedDots.map((dot, index) => (
              <div
                data-testid={`selected-dot-${index}`}
                key={index}
                className="selected-dot py-1 pl-1.5 pr-4 desktop:pr-5 desktop:pl-1.5 bg-off-white-2 border-light-grey-2 border flex items-center 
              gap-2.5 desktop:gap-4 rounded-full text-[14px] max-sm:text-[15px] desktop:text-[16px] text-dark-black font-medium
              max-sm:h-[34px] max-sm:gap-3 max-sm:leading-[150%] max-sm:py-[5px]
              "
              >
                {dot.dot_type === "thumbs_up" ? (
                  <AttributeContentThumbsUp className="h-[27px] w-[27px] desktop:h-7 desktop:w-7" height={28} width={28} />
                ) : dot.dot_type === "ok" ? (
                  <AttributeContentOK className="h-[27px] w-[27px] desktop:h-7 desktop:w-7" height={28} width={28}  />
                ) : (
                  <AttributeContentLoop className="h-[27px] w-[27px] desktop:h-7 desktop:w-7" height={28} width={28}  />
                )}{" "}
                {dot.label}
                {type === "give" && (
                  <button
                    className="relative"
                    onClick={() => removeSelectedDot(index)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="15"
                      viewBox="0 0 14 15"
                      fill="none"
                      className="h-[13px] w-3 desktop:h-4 desktop:w-4 max-sm:w-[11px] max-sm:h-3"
                    >
                      <path
                        d="M13.3016 0.995971C13.6922 1.3865 13.6922 2.01966 13.3016 2.41018L8.21309 7.49873L13.3023 12.588C13.6924 12.9784 13.6924 13.6117 13.3023 14.0022C12.9119 14.3926 12.2787 14.3924 11.8881 14.0022L6.79888 8.91294L1.71448 13.9973C1.32395 14.3879 0.690783 14.3879 0.300262 13.9973C-0.0902159 13.6068 -0.0902382 12.9736 0.300262 12.5831L5.38466 7.49873L0.300953 2.41502C-0.0895716 2.02449 -0.0895719 1.39133 0.300953 1.00081C0.691503 0.6106 1.32475 0.610387 1.71517 1.00081L6.79888 6.08452L11.8874 0.995971C12.2779 0.605461 12.9111 0.605489 13.3016 0.995971Z"
                        fill="#5F6D7E"
                      />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-5 max-sm:flex-col max-sm:items-center max-sm:gap-[5px]">
          <div className="flex flex-col gap-2 w-full">
            <textarea
              id="dot-textarea"
              data-testid="dot-textarea"
              ref={textAreaTouchRef}
              className="text-[15px] h-[72px] w-full desktop:h-20 desktop:w-[68.8vw]
             desktop:text-base px-4 py-2 border border-light-grey-2 rounded-md focus:outline-0
             max-sm:min-h-[299px] max-sm:text-[16px] max-sm:leading-[147%] max-sm:py-[7px] max-sm:px-[15px]
             max-sm:font-inter placeholder:text-[16px] font-inter placeholder:font-medium placeholder:text-[#6D6B6B]"
              rows={4}
              placeholder="Add comment"
              defaultValue={initialComment}
              onChange={(e) =>
                setFeedBackWordCount(
                  e.target.value.split(" ").filter((word) => word).length
                )
              }
              disabled={isRewriting}
            ></textarea>
            <div className="flex gap-2">
              <button
                onClick={handleRewriteByAI}
                disabled={isRewriting || isSelectingDots || !textAreaTouchRef.current?.value}
                className="px-4 py-2 text-sm font-medium text-light-black bg-background-grey rounded-lg
                  hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isRewriting ? "Rewriting..." : "Rewrite by AI"}
              </button>
              <button
                onClick={handleSelectDotsByAI}
                disabled={isSelectingDots || isRewriting || !textAreaTouchRef.current?.value}
                className="px-4 py-2 text-sm font-medium text-light-black bg-background-grey rounded-lg
                  hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSelectingDots ? "Selecting..." : "Select Dots by AI"}
              </button>
            </div>
          </div>
          <div className="relative w-full max-w-60 max-sm:flex flex-col gap-4 max-sm:max-w-max">
            {feedBackWordCount < 5 && (
              <span className="text-dark-grey text-sm pb-4 inline-block max-sm:pb-0 max-sm:text-center">
                minimum {5 - feedBackWordCount}{" "}
                {feedBackWordCount === 4 ? "word" : "words"} remaining
              </span>
            )}
            <div className="max-sm:flex flex gap-2">
              <button
                className="hidden max-sm:block w-[173.5px] h-9 py-1.5 px-8
            text-light-black font-inter text-base bg-background-grey rounded-lg
            font-medium leading-[150%]
            "
                onClick={() => setShowTextFieldForTouchscreen(false)}
              >
                Back
              </button>
              <button
                data-testid="submit-dot-btn"
                className="w-full max-w-[201px] desktop:max-w-[217px] h-[34px] desktop:h-10 bg-light-black 
              text-off-white rounded-lg hover:bg-dark-black disabled:bg-middle-grey
              max-sm:h-9 max-sm:w-[173.5px] max-sm:rounded-lg
              font-medium text-base desktop:text-lg leading-[150%]"
                onClick={handleSubmit}
                disabled={disabled}
              >
                {isPending ? "Submitting…" : "Give Dot"}
              </button>
            </div>
          </div>
        </div>
        {errorMsg && (
          <ErrorPopup
            errorText={errorMsg}
            onClose={() => setErrorMsg(null)}
          />
        )}
      </div>

      {/* Non-touchscreen text field */}
      <div
        data-testid="dot-text-field-root"
        id="text-field-component"
        className="max-sm:hidden px-10 desktop:px-[70px] pt-5 pb-[22px] desktop:pb-7 fixed bottom-0 bg-off-white w-full max-sm:h-full max-sm:pt-[50px] max-sm:px-[17px]"
        style={{ boxShadow: "0px -4px 6px rgba(0, 0, 0, 0.1)" }}
      >
        <div className="hidden max-sm:block text-[14px] pt-4 text-dark-grey leading-[125%] font-medium pb-1.5 border-b border-light-grey mb-3.5 px-0.5">
          Dot Summary
        </div>
        {/* Selected dots */}
        {selectedDots.length > 0 && (
          <div className="selected-dots flex gap-2 desktop:gap-3 mb-5 max-sm:mb-7 flex-wrap">
            {selectedDots.map((dot, index) => (
              <div
                data-testid={`selected-dot-${index}`}
                key={index}
                className="selected-dot py-[3px] pl-1 pr-4 desktop:pr-5 bg-off-white-2 border-light-grey-2 border flex items-center 
              gap-2.5 desktop:gap-4 rounded-full text-[14px] text-dark-black font-medium
              max-sm:h-[34px] max-sm:gap-3 max-sm:leading-[150%] max-sm:py-[5px]"
              >
                {dot.dot_type === "thumbs_up" ? (
                  <AttributeContentThumbsUp className="h-[27px] w-[27px] desktop:h-7 desktop:w-7" height={28} width={28} />
                ) : dot.dot_type === "ok" ? (
                  <AttributeContentOK className="h-[27px] w-[27px] desktop:h-7 desktop:w-7" height={28} width={28} />
                ) : (
                  <AttributeContentLoop className="h-[27px] w-[27px] desktop:h-7 desktop:w-7" height={28} width={28} />
                )}{" "}
                {dot.label}
                {type === "give" && (
                  <button
                    className="relative"
                    onClick={() => removeSelectedDot(index)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="15"
                      viewBox="0 0 14 15"
                      fill="none"
                      className="h-[13px] w-3 desktop:h-4 desktop:w-4 max-sm:w-[11px] max-sm:h-3"
                    >
                      <path
                        d="M13.3016 0.995971C13.6922 1.3865 13.6922 2.01966 13.3016 2.41018L8.21309 7.49873L13.3023 12.588C13.6924 12.9784 13.6924 13.6117 13.3023 14.0022C12.9119 14.3926 12.2787 14.3924 11.8881 14.0022L6.79888 8.91294L1.71448 13.9973C1.32395 14.3879 0.690783 14.3879 0.300262 13.9973C-0.0902159 13.6068 -0.0902382 12.9736 0.300262 12.5831L5.38466 7.49873L0.300953 2.41502C-0.0895716 2.02449 -0.0895719 1.39133 0.300953 1.00081C0.691503 0.6106 1.32475 0.610387 1.71517 1.00081L6.79888 6.08452L11.8874 0.995971C12.2779 0.605461 12.9111 0.605489 13.3016 0.995971Z"
                        fill="#5F6D7E"
                      />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-5 max-sm:flex-col max-sm:items-center max-sm:gap-[5px]">
          <div className="flex flex-col gap-2 flex-1">
            <textarea
              id="dot-textarea"
              data-testid="dot-textarea"
              ref={textAreaRef}
              className="text-[15px] h-[72px] w-[925px] desktop:h-20 desktop:w-[69.1vw]
             desktop:text-base px-4 py-2 border border-light-grey-2 rounded-md focus:outline-0
             max-sm:min-h-[299px] max-sm:w-full max-sm:text-[16px] max-sm:leading-[147%] max-sm:py-[7px] max-sm:px-[15px]
             max-sm:font-inter placeholder:text-[16px] placeholder:font-inter placeholder:font-medium placeholder:text-[#6D6B6B]"
              rows={4}
              placeholder="Add comment"
              defaultValue={initialComment}
              onChange={(e) =>
                setFeedBackWordCount(
                  e.target.value.split(" ").filter((word) => word).length
                )
              }
              disabled={isRewriting}
            ></textarea>
            <div className="flex gap-2">
              <button
                onClick={handleRewriteByAI}
                disabled={isRewriting || isSelectingDots || !textAreaRef.current?.value}
                className="px-4 py-2 text-sm font-medium text-light-black bg-background-grey rounded-lg
                  hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isRewriting ? "Rewriting..." : "Rewrite by AI"}
              </button>
              <button
                onClick={handleSelectDotsByAI}
                disabled={isSelectingDots || isRewriting || !textAreaRef.current?.value}
                className="px-4 py-2 text-sm font-medium text-light-black bg-background-grey rounded-lg
                  hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSelectingDots ? "Selecting..." : "Select Dots by AI"}
              </button>
            </div>
          </div>
          <div className="relative w-full max-w-60 max-sm:flex flex-col gap-4 max-sm:max-w-max">
            {feedBackWordCount < 5 && (
              <span className="text-dark-grey text-sm pb-4 inline-block max-sm:pb-0 max-sm:text-center">
                minimum {5 - feedBackWordCount}{" "}
                {feedBackWordCount === 4 ? "word" : "words"} remaining
              </span>
            )}
            <div className="max-sm:flex flex gap-2">
              <button
                className="hidden max-sm:block w-[173.5px] h-9 py-1.5 px-8
            text-light-black font-inter text-base bg-background-grey rounded-lg
            font-medium leading-[150%]
            "
                onClick={() => setShowTextFieldForTouchscreen(false)}
              >
                Back
              </button>
              <button
                data-testid="submit-dot-btn"
                className="w-full max-w-[201px] desktop:max-w-[217px] h-[34px] desktop:h-10 bg-light-black 
              text-off-white rounded-lg hover:bg-dark-black disabled:bg-middle-grey
              max-sm:h-9 max-sm:w-[173.5px] max-sm:rounded-lg
              font-medium text-base desktop:text-lg leading-[150%]"
                onClick={handleSubmit}
                disabled={disabled}
              >
                {isPending ? "Submitting…" : "Give Dot"}
              </button>
            </div>
          </div>
        </div>
        {errorMsg && (
          <ErrorPopup errorText={errorMsg} onClose={() => setErrorMsg(null)} />
        )}
      </div>
    </>
  );
};

export default DotTextField;
