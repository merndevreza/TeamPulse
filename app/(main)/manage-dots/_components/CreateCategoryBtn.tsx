"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import CreateCategoryPopup from "./CreateCategoryPopup";
import { createDotCategory } from "@/app/actions/manage-dots/manage-dots-api";
import ErrorPopup from "@/components/ErrorPopup";

const CreateCategoryBtn = () => {
  const router = useRouter();
  const [showPopup, setShowPopup] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={showPopup}
        onClick={() => setShowPopup(true)}
        role="button"
        className="px-9.5 desktop:px-8 desktop:pt-2 pt-[5px] pb-[5px] desktop:pb-[7px] rounded-[10px] bg-light-orange text-off-white font-inter font-medium focus:outline-none transition-transform active:scale-95 text-[16px] desktop:text-[17px] max-sm:absolute max-sm:px-3 max-sm:h-9 max-sm:rounded-lg max-sm:top-[70px] max-sm:right-3">
        Create Category
      </button>

      <CreateCategoryPopup
        show={showPopup}
        setShowPopup={setShowPopup}
        title="Create Category"
        label="New category name"
        submitLabel="Save"
        submitting={isPending}
        onSubmit={(name) =>
          startTransition(async () => {
            const res = await createDotCategory(name);
            if (!res.success) {
              setErrorMsg(
                res.message || "Couldn’t create the category. Please try again."
              );
              setShowPopup(false);
              return;
            }
            setShowPopup(false);
            router.refresh();
          })
        }
      />
      {errorMsg && (
        <ErrorPopup errorText={errorMsg} onClose={() => setErrorMsg(null)} />
      )}
    </>
  );
};

export default CreateCategoryBtn;
