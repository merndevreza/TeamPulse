"use client";
import React, { useEffect, useState } from "react";
import {
  DotCategory,
  DotDetailedResult,
  OtherUser,
} from "@/app/actions/api/types";
import Header from "./Header";
import UserList from "./UserList";
import SearchContainer from "./SearchContainer";
import DotsContainer from "./DotsContainer";
import DotTextField from "./DotTextField";
import SuccessElement from "./SuccessElement";
import LeavePagePopup from "@/app/give-dot/_components/LeavePagePopup";

export interface SelectedDot {
  label_id: number;
  label: string;
  dot_type: string;
  categoryName: string;
}

const Wrapper = ({
  token,
  allUsers,
  allDots,
  type = "give",
  dotId = "",
  detailedGivenDots,
}: {
  token: string;
  allUsers?: OtherUser[];
  allDots: DotCategory[];
  type?: "give" | "edit";
  dotId?: string;
  detailedGivenDots?: DotDetailedResult[] | null;
}) => {
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [showUserList, setShowUserList] = useState(true);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [selectedDots, setSelectedDots] = useState<SelectedDot[]>([]);
  const [previouslyEditedDotData, setPreviouslyEditedDotData] = useState<{
    dotId?: string;
    comment?: string;
    selectedDots?: SelectedDot[];
  } | null>(null);
  const [originalSelectedDots, setOriginalSelectedDots] = useState<SelectedDot[] | null>(null);

  useEffect(() => {
    if (type !== "give") return;

    // Ensure current page has its own history state so back goes to previous page
    history.replaceState({ _giveDotCurrent: true }, "", window.location.href);

    const handlePopState = () => {
      // Only open popup if user has started composing (both arrays non-empty)
      if (selectedUsers.length > 0 && selectedDots.length > 0) {
        // Re-push current state to keep user here
        history.pushState(
          { _giveDotBlock: Date.now() },
          "",
          window.location.href
        );
        setConfirmLeave(true);
      } else {
        // Allow natural back navigation (do nothing)
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [type, selectedUsers, selectedDots]);

  // Load edited (latest) data only
  useEffect(() => {
    if (type !== "edit") return;
    if (typeof window === "undefined") return;
    try {
      const json = sessionStorage.getItem("previouslyEditedDotData");
      if (json) setPreviouslyEditedDotData(JSON.parse(json));
    } catch {
      /* ignore */
    }
  }, [type]);

  const existingDotFeedback = detailedGivenDots?.find(
    (dot) => dot?.id === Number(dotId)
  );

  // Prefer previouslyEditedDotData for current edit state; capture original for undo only once
  useEffect(() => {
    if (type !== "edit") return;
    if (previouslyEditedDotData?.selectedDots?.length) {
      setSelectedDots(previouslyEditedDotData.selectedDots);
      if (!originalSelectedDots && existingDotFeedback) {
        // original = server data before current edits
        const mapped = existingDotFeedback.details.map((detail) => ({
          label_id: detail.label_id,
          label:
            allDots
              .flatMap((c) => c.labels || [])
              .find((l) => l.id === detail.label_id)?.label || "Unknown Label",
          dot_type: detail.dot_type_name,
          categoryName:
            allDots.find((c) => c.labels?.some((l) => l.id === detail.label_id))?.name ||
            "Unknown Category",
        }));
        setOriginalSelectedDots(mapped);
      }
      return;
    }
    if (existingDotFeedback) {
      const mapped = existingDotFeedback.details.map((detail) => ({
        label_id: detail.label_id,
        label:
          allDots
            .flatMap((c) => c.labels || [])
            .find((l) => l.id === detail.label_id)?.label || "Unknown Label",
        dot_type: detail.dot_type_name,
        categoryName:
          allDots.find((c) => c.labels?.some((l) => l.id === detail.label_id))?.name ||
          "Unknown Category",
      }));
      setSelectedDots(mapped);
      if (!originalSelectedDots) setOriginalSelectedDots(mapped);
    }
  }, [allDots, existingDotFeedback, type, previouslyEditedDotData, originalSelectedDots]);

  const initialComment =
    type === "edit"
      ? previouslyEditedDotData?.comment || existingDotFeedback?.comment || ""
      : "";

  const [showTextFieldForTouchscreen, setShowTextFieldForTouchscreen] = useState(false);

  return (
    <>
      <Header
        selectedUsers={selectedUsers}
        selectedDots={selectedDots}
        setSelectedUsers={setSelectedUsers}
        showUserList={showUserList}
        setShowUserList={setShowUserList}
        type={type}
        setConfirmLeave={setConfirmLeave}
        showTextFieldForTouchscreen={showTextFieldForTouchscreen}
      />
      {type === "give" && (
        <UserList
          allUsers={allUsers || []}
          selectedUsers={selectedUsers}
          setSelectedUsers={setSelectedUsers}
          showUserList={showUserList}
          setShowUserList={setShowUserList}
        />
      )}
      <SearchContainer selectedDots={selectedDots} />
      <DotsContainer
        allDots={allDots}
        selectedDots={selectedDots}
        setSelectedDots={setSelectedDots}
        type={type}
      />
      <div className={type === "give" && showUserList ? "hidden" : ""}>
        <DotTextField
          key={
            type === "edit"
              ? `edit-${previouslyEditedDotData ? "loaded" : "initial"}`
              : "give"
          }
          token={token}
          allDots={allDots}
          selectedDots={selectedDots}
          setSelectedDots={setSelectedDots}
          dotId={dotId}
          selectedUsers={selectedUsers}
          setSelectedUsers={setSelectedUsers}
          type={type}
          setHasSubmitted={setHasSubmitted}
          initialComment={initialComment}
          originalSelectedDots={originalSelectedDots || []}
          showTextFieldForTouchscreen={showTextFieldForTouchscreen}
          setShowTextFieldForTouchscreen={setShowTextFieldForTouchscreen}
        />
      </div>

      <SuccessElement hasSubmitted={hasSubmitted} type={type} />
      {type === "give" && (
        <LeavePagePopup
          isOpen={confirmLeave}
          onClose={() => setConfirmLeave(false)}
        />
      )}
    </>
  );
};

export default Wrapper;
