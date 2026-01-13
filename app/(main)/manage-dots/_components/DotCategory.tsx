"use client";

import React from "react";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { DotCategory as DotCategoryType } from "@/app/actions/api/types";
import AccordionArrow from "@/components/CommonSVGs/AccordionArrow";
import CreateCategoryPopup from "./CreateCategoryPopup";
import ConfirmDialog from "./ConfirmDialog";
import {
  updateDotCategory,
  deleteDotCategory,
  createDotLabel,
  updateDotLabel,
  deleteDotLabel,
} from "@/app/actions/manage-dots/manage-dots-api";
import { DeleteSVG, EditSVG } from "@/components/CommonSVGs/AdminRouteSVGs";
import HoverTooltip from "@/components/HoverTooltip.tsx/HoverTooltip";
import ErrorPopup from "@/components/ErrorPopup";

type Props = {
  dot: DotCategoryType;
  token?: string;
  toggleAllAccordions?: boolean;
};

type DotPopupState =
  | { open: false }
  | { open: true; mode: "create" }
  | { open: true; mode: "edit"; id: number; initial: string };

export default function DotCategory({
  dot,
  toggleAllAccordions = true,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(toggleAllAccordions);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // category edit (inline)
  const [catEditing, setCatEditing] = useState(false);
  const [catName, setCatName] = useState(dot.name);

  // popup for dot create/edit
  const [dotPopup, setDotPopup] = useState<DotPopupState>({ open: false });

  // delete confirmations
  const [confirmDelCategory, setConfirmDelCategory] = useState(false);
  const [confirmDelLabel, setConfirmDelLabel] = useState<null | {
    id: number;
    name: string;
  }>(null);

  // Touch swipe state for category header
  const [catTouchSwiped, setCatTouchSwiped] = useState(false);
  const catTouchStartX = useRef<number | null>(null);
  const catTouchStartY = useRef<number | null>(null);
  const catIsSwiping = useRef(false);

  // Touch swipe state for labels
  const [labelTouchSwiped, setLabelTouchSwiped] = useState<number | false>(
    false
  );
  const labelTouchStartX = useRef<number | null>(null);
  const labelTouchStartY = useRef<number | null>(null);
  const labelIsSwiping = useRef(false);
  const labelSwipingId = useRef<number | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = useState<string>("500px");

  const mountedRef = useRef(false);

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    if (open) {
      setMaxHeight(`${el.scrollHeight}px`);
    } else {
      setMaxHeight("0px");
    }

    // mark as mounted after first paint
    if (!mountedRef.current) {
      mountedRef.current = true;
    }
  }, [open, dot.labels.length]);

  useEffect(() => {
    setOpen(toggleAllAccordions);
  }, [toggleAllAccordions]);

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    if (open) {
      const h = el.scrollHeight;
      setMaxHeight(`${h}px`);
      const id = window.setTimeout(() => setMaxHeight("500px"), 300);
      return () => window.clearTimeout(id);
    } else {
      setMaxHeight("0px");
    }
  }, [open, dot.labels.length]);

  const onToggle = () => setOpen((v) => !v);

  // CATEGORY: save / delete
  const handleEditCategory = () => {
    const value = catName.trim();
    if (!value) return;
    startTransition(async () => {
      const res = await updateDotCategory(dot.id, { name: value });
      if (!res.success) {
        setErrorMsg(
          res.message || "Couldn’t rename the category. Please try again."
        );
        return;
      }
      setCatEditing(false);
      router.refresh();
    });
  };

  const handleDeleteCategory = () => {
    setConfirmDelCategory(true);
  };

  // DOT: create/edit/delete
  function openCreateDot() {
    setDotPopup({ open: true, mode: "create" });
  }
  function openEditDot(id: number, initial: string) {
    setDotPopup({ open: true, mode: "edit", id, initial });
  }
  const onSubmitDot = (val: string) => {
    if (!val.trim() || !dotPopup.open) return;
    startTransition(async () => {
      if (dotPopup.mode === "create") {
        const res = await createDotLabel(dot.id, val.trim());
        if (!res.success) {
          setErrorMsg(
            res.message || "Couldn’t create the label. Please try again."
          );
          return;
        }
      } else {
        const res = await updateDotLabel(dotPopup.id, {
          category: dot.id,
          label: val.trim(),
        });
        if (!res.success) {
          setErrorMsg(
            res.message || "Couldn’t save changes. Please try again."
          );
          return;
        }
      }
      setDotPopup({ open: false });
      router.refresh();
    });
  };

  const handleDeleteLabel = (labelId: number, name: string) => {
    setConfirmDelLabel({ id: labelId, name });
  };

  const panelId = `dot-panel-${dot.id}`;
  const buttonId = `dot-button-${dot.id}`;

  const [showTitleIcons, setShowTitleIcons] = useState(false);
  const [showLabelIcons, setShowLabelIcons] = useState<number | false>(false);
  const [iconEditHovered, setEditIconHovered] = useState(false);
  const [iconDelHovered, setDeleteIconHovered] = useState(false);
  const [showTitleTooltip, setShowTitleTooltip] = useState(false);
  const [showLabelTooltip, setShowLabelTooltip] = useState<number | false>(
    false
  );
  const labelTooltipTimerRef = useRef<number | null>(null);
  const catNameRef = useRef<HTMLSpanElement>(null);
  // NEW: timer + hover state for category tooltip
  const catTooltipTimerRef = useRef<number | null>(null);
  const [catHeaderHovered, setCatHeaderHovered] = useState(false);

  // Detect if device has touch capability
  const isTouchDevice = useRef(false);

  useEffect(() => {
    isTouchDevice.current =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;
  }, []);

  // helper
  const isTruncated = (el: HTMLElement | null) =>
    !!el && el.scrollWidth > el.clientWidth;

  // REPLACED effect: use delayed show (200ms) when icons appear while hovered
  useEffect(() => {
    if (!catHeaderHovered) return;
    const el = catNameRef.current;
    if (!el) return;
    if (showTitleIcons) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (isTruncated(el)) {
            if (!catTooltipTimerRef.current) {
              catTooltipTimerRef.current = window.setTimeout(() => {
                setShowTitleTooltip(true);
                catTooltipTimerRef.current = null;
              }, 200);
            }
          } else {
            setShowTitleTooltip(false);
          }
        });
      });
    } else {
      // if icons hide, cancel timer
      if (catTooltipTimerRef.current) {
        clearTimeout(catTooltipTimerRef.current);
        catTooltipTimerRef.current = null;
      }
      setShowTitleTooltip(false);
    }
  }, [showTitleIcons, catHeaderHovered, catName]);

  return (
    <div
      className="pt-2.5 desktop:pt-3 pb-2 desktop:pb-2.5 pl-5 pr-[21px] rounded-xl bg-off-white max-sm:w-full h-max 
      shadow-custom max-sm:shadow-none max-sm:rounded-none"
    >
      {/* header */}
      <div
        className={`flex hover:bg-background-grey items-center gap-4.5 border-b border-light-grey-2 pl-5 desktop:pl-3 pb-[7px] desktop:pb-[11px] pr-1.5 max-sm:pb-1 relative max-sm:overflow-hidden text-highlight-grey`}
        onPointerEnter={() => {
          setCatHeaderHovered(true);
          setShowTitleIcons(true);
        }}
        onPointerLeave={() => {
          setCatHeaderHovered(false);
          setShowTitleIcons(false);
          if (catTooltipTimerRef.current) {
            clearTimeout(catTooltipTimerRef.current);
            catTooltipTimerRef.current = null;
          }
          setShowTitleTooltip(false);
        }}
        onTouchStart={(e) => {
          const touch = e.touches[0];
          catTouchStartX.current = touch.clientX;
          catTouchStartY.current = touch.clientY;
          catIsSwiping.current = false;
        }}
        onTouchMove={(e) => {
          if (
            catTouchStartX.current === null ||
            catTouchStartY.current === null
          )
            return;

          const touch = e.touches[0];
          const deltaX = catTouchStartX.current - touch.clientX;
          const deltaY = Math.abs(catTouchStartY.current - touch.clientY);

          // Only treat as horizontal swipe if horizontal movement > vertical movement
          if (Math.abs(deltaX) > 10 && Math.abs(deltaX) > deltaY) {
            catIsSwiping.current = true;

            if (deltaX > 30) {
              // Swiped left - show icons
              setCatTouchSwiped(true);
            } else if (deltaX < -30) {
              // Swiped right - hide icons
              setCatTouchSwiped(false);
            }
          }
        }}
        onTouchEnd={() => {
          catTouchStartX.current = null;
          catTouchStartY.current = null;
          catIsSwiping.current = false;
        }}
      >
        {!catEditing ? (
          <>
            <div
              className="text-dark-grey text-[16px] desktop:text-[17px] flex-1 min-w-0 relative cursor-default
            max-sm:text-[18px] max-sm:leading-[150%]
            "
            >
              <span
                ref={catNameRef}
                className="truncate block w-full text-highlight-grey"
                data-testid={`dot-category-name-${dot.id}`}
                onPointerEnter={() => {
                  const el = catNameRef.current;
                  if (catTooltipTimerRef.current) {
                    clearTimeout(catTooltipTimerRef.current);
                    catTooltipTimerRef.current = null;
                  }
                  if (!isTruncated(el)) {
                    setShowTitleTooltip(false);
                    return;
                  }
                  catTooltipTimerRef.current = window.setTimeout(() => {
                    setShowTitleTooltip(true);
                    setEditIconHovered(false);
                    setDeleteIconHovered(false);
                    catTooltipTimerRef.current = null;
                  }, 200);
                }}
                onPointerLeave={() => {
                  if (catTooltipTimerRef.current) {
                    clearTimeout(catTooltipTimerRef.current);
                    catTooltipTimerRef.current = null;
                  }
                  if (!showTitleIcons) setShowTitleTooltip(false);
                }}
              >
                {catName}
              </span>
              <HoverTooltip
                show={showTitleTooltip}
                content={catName}
                tipX={80}
                containerX={-20}
                containerY={0}
              />
            </div>

            <button
              type="button"
              className="text-[15px] desktop:text-[17px] underline text-dark-black disabled:opacity-60 relative"
              onClick={() => setCatEditing(true)}
              disabled={isPending}
              onPointerEnter={() => {
                setEditIconHovered(true);
                setShowTitleTooltip(false);
              }}
              onPointerLeave={() => setEditIconHovered(false)}
              style={{
                display: showTitleIcons || catTouchSwiped ? "inline" : "none",
                pointerEvents:
                  showTitleIcons || catTouchSwiped ? "auto" : "none",
              }}
            >
              <EditSVG
                fill={iconEditHovered ? "var(--actions-blue)" : "var(--middle-grey)"}
                className="w-5.5"
              />
              <HoverTooltip
                show={iconEditHovered}
                content="Edit category"
                tipX={32}
                containerX={-30}
                containerY={-2}
              />
            </button>

            <button
              type="button"
              className="text-[15px] desktop:text-[17px] underline text-warning-red relative"
              onClick={handleDeleteCategory}
              disabled={isPending || dot.labels.length > 0}
              role="button"
              aria-label="delete category"
              onPointerEnter={() => {
                setDeleteIconHovered(true);
                setShowTitleTooltip(false);
              }}
              onPointerLeave={() => setDeleteIconHovered(false)}
              style={{
                display: showTitleIcons || catTouchSwiped ? "inline" : "none",
                pointerEvents:
                  showTitleIcons || catTouchSwiped ? "auto" : "none",
              }}
            >
              <DeleteSVG
                fill={
                  iconDelHovered && dot.labels.length > 0
                    ? "var(--actions-blue)"
                    : "var(--middle-grey)"
                }
                className="w-5"
              />
              <HoverTooltip
                show={iconDelHovered}
                content={
                  dot.labels.length > 0
                    ? "First, you need to delete all the dots in this category"
                    : "Delete category"
                }
                tipX={dot.labels.length > 0 ? 185 : 45}
                containerX={dot.labels.length > 0 ? -180 : -40}
                containerY={-2}
              />
            </button>
            <span className="inline-block h-8 w-px mr-1 bg-light-grey-2" style={{
              display: showTitleIcons || catTouchSwiped ? "inline" : "none",
            }}></span>
            <button
              id={buttonId}
              aria-controls={panelId}
              aria-expanded={open}
              onClick={onToggle}
              className="ml-1 h-8 w-8 grid place-items-center rounded"
              aria-label={open ? "Collapse category" : "Expand category"}
            >
              <AccordionArrow
                className={`h-3.5 w-4.5 transition-transform duration-300 ${open ? "rotate-0" : "rotate-180"
                  }`}
              />
            </button>
          </>
        ) : (
          <>
            <label htmlFor={`edit-category-${dot.id}`} className="sr-only">
              Edit category name
            </label>
            <input
              id={`edit-category-${dot.id}`}
              name="category_name"
              type="text"
              className="flex-1 rounded-md border border-light-grey-2 px-3 py-1 focus:outline-none"
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              onKeyDown={async (e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleEditCategory();
                }
                if (e.key === "Escape") {
                  setCatEditing(false);
                  setCatName(dot.name);
                }
              }}
              autoFocus
              disabled={isPending}
              aria-label="Edit category name"
              autoComplete="off"
            />
            <button
              type="button"
              className="text-[14px] underline text-dark-black hover:opacity-80 disabled:opacity-60"
              onClick={handleEditCategory}
              disabled={isPending || !catName.trim()}
            >
              Save
            </button>
            <button
              type="button"
              className="text-[14px] underline text-[#7C8B9D] hover:opacity-80 disabled:opacity-60"
              onClick={() => {
                setCatEditing(false);
                setCatName(dot.name);
              }}
              disabled={isPending}
            >
              Cancel
            </button>

            <button
              id={buttonId}
              aria-controls={panelId}
              aria-expanded={open}
              onClick={onToggle}
              className="ml-1 h-8 w-8 grid place-items-center rounded"
              aria-label={open ? "Collapse category" : "Expand category"}
            >
              <AccordionArrow
                className={`h-3.5 w-3.5 transition-transform duration-300 ${open ? "rotate-180" : "rotate-0"
                  }`}
              />
            </button>
          </>
        )}
      </div>

      {/* panel */}
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        ref={panelRef}
        style={{
          overflow: "hidden",
          maxHeight,
          // transition: enableTransition ? "max-height 0.3s ease" : "none",
        }}
      >
        <ul>
          {dot.labels.map((label) => (
            <li
              key={label.id ?? label.label}
              className="relative group pl-6 border-b border-light-grey-2 hover:bg-background-grey flex items-center justify-between gap-3 text-[14px] max-sm:px-5 max-sm:min-h-[50px] max-sm:overflow-hidden"
              onPointerEnter={() => {
                // show action icons immediately
                setShowLabelIcons(label.id);
              }}
              onPointerLeave={() => {
                setShowLabelIcons(false);
                // hide tooltip & clear any pending timer
                if (labelTooltipTimerRef.current) {
                  clearTimeout(labelTooltipTimerRef.current);
                  labelTooltipTimerRef.current = null;
                }
                setShowLabelTooltip(false);
              }}
              onTouchStart={(e) => {
                const touch = e.touches[0];
                labelTouchStartX.current = touch.clientX;
                labelTouchStartY.current = touch.clientY;
                labelIsSwiping.current = false;
                labelSwipingId.current = label.id;
              }}
              onTouchMove={(e) => {
                if (
                  labelTouchStartX.current === null ||
                  labelTouchStartY.current === null
                )
                  return;
                if (labelSwipingId.current !== label.id) return;

                const touch = e.touches[0];
                const deltaX = labelTouchStartX.current - touch.clientX;
                const deltaY = Math.abs(
                  labelTouchStartY.current - touch.clientY
                );

                // Only treat as horizontal swipe if horizontal movement > vertical movement
                if (Math.abs(deltaX) > 10 && Math.abs(deltaX) > deltaY) {
                  labelIsSwiping.current = true;

                  if (deltaX > 30) {
                    // Swiped left - show icons for this label
                    setLabelTouchSwiped(label.id);
                  } else if (deltaX < -30) {
                    // Swiped right - hide icons
                    setLabelTouchSwiped(false);
                  }
                }
              }}
              onTouchEnd={() => {
                labelTouchStartX.current = null;
                labelTouchStartY.current = null;
                labelIsSwiping.current = false;
                labelSwipingId.current = null;
              }}
            >
              {/* Background overlay for swipe */}
              <div
                className="absolute inset-0 bg-background-grey ease-out"
                style={{
                  transform:
                    labelTouchSwiped === label.id
                      ? "translateX(0)"
                      : "translateX(100%)",
                }}
              />
              <span
                className="truncate block max-sm:relative max-sm:z-1 text-dark-black desktop:pt-[11px] py-[9px] desktop:pb-3"
                data-testid={`dot-label-${label.id}`}
                onPointerEnter={(e) => {
                  // clear any previous timer
                  if (labelTooltipTimerRef.current) {
                    clearTimeout(labelTooltipTimerRef.current);
                  }
                  const el = e.currentTarget as HTMLSpanElement;
                  const isTruncated = el.scrollWidth > el.clientWidth;
                  if (!isTruncated) {
                    // not truncated: ensure tooltip stays hidden
                    setShowLabelTooltip(false);
                    return;
                  }
                  labelTooltipTimerRef.current = window.setTimeout(() => {
                    setShowLabelTooltip(label.id);
                    setEditIconHovered(false);
                    setDeleteIconHovered(false);
                    labelTooltipTimerRef.current = null;
                  }, 200);
                }}
                onPointerLeave={() => {
                  if (labelTooltipTimerRef.current) {
                    clearTimeout(labelTooltipTimerRef.current);
                    labelTooltipTimerRef.current = null;
                  }
                  setShowLabelTooltip(false);
                }}
              >
                {label.label}
              </span>
              <HoverTooltip
                show={showLabelTooltip === label.id}
                content={label.label}
                tipX={80}
                containerX={-20}
                containerY={30}
              />
              <div
                className="flex items-center gap-5 pr-6.5"
                style={{
                  display:
                    showLabelIcons === label.id || labelTouchSwiped === label.id
                      ? "flex"
                      : "none",
                  pointerEvents:
                    showLabelIcons === label.id || labelTouchSwiped === label.id
                      ? "auto"
                      : "none",
                }}
              >
                <button
                  type="button"
                  className="rounded focus:outline-none disabled:opacity-60 relative"
                  onClick={() => openEditDot(label.id, label.label)}
                  disabled={isPending}
                  aria-label={`Edit ${label.label}`}
                  onPointerEnter={() => {
                    setEditIconHovered(true);
                    setShowLabelTooltip(false);
                  }}
                  onPointerLeave={() => setEditIconHovered(false)}
                >
                  <EditSVG
                    fill={iconEditHovered ? "var(--actions-blue)" : "#6D6B6B"}
                    className="h-[22px]"
                  />
                  <HoverTooltip
                    show={iconEditHovered}
                    content="Edit dot"
                    tipX={32}
                    containerX={-30}
                    containerY={-2}
                  />
                </button>
                <button
                  type="button"
                  className="rounded focus:outline-none disabled:opacity-60 relative"
                  onClick={() => handleDeleteLabel(label.id, label.label)}
                  disabled={isPending}
                  onPointerEnter={() => {
                    setDeleteIconHovered(true);
                    setShowLabelTooltip(false);
                  }}
                  onPointerLeave={() => setDeleteIconHovered(false)}
                  aria-label={`Delete ${label.label}`}
                >
                  <DeleteSVG
                    fill={iconDelHovered ? "var(--actions-blue)" : "#6D6B6B"}
                    className="h-5"
                  />
                  <HoverTooltip
                    show={iconDelHovered}
                    content="Delete dot"
                    tipX={45}
                    containerX={-40}
                    containerY={-2}
                  />
                </button>
              </div>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="w-full hover:bg-background-grey flex items-center gap-4.5 text-left pl-6.5 py-1 desktop:py-1.5 border-b border-light-grey-2 focus:outline-none disabled:opacity-60 text-actions-blue"
          onClick={openCreateDot}
          disabled={isPending}
        >
          <span className="text-[26px] leading-tight font-light">+</span>
          <span className="text-[14px] leading-tight">Create new dot</span>
        </button>
      </div>

      {/* Create/Edit Dot popup (single-field) */}
      {dotPopup.open && (
        <CreateCategoryPopup
          show={dotPopup.open}
          setShowPopup={(s) => !s && setDotPopup({ open: false })}
          title={dotPopup.mode === "create" ? "Create new dot" : "Edit dot"}
          label={dotPopup.mode === "create" ? "Type in new dot" : "Type in modification"}
          submitLabel={dotPopup.mode === "create" ? "Create" : "Save"}
          initialValue={dotPopup.mode === "edit" ? dotPopup.initial : ""}
          placeholder=""
          submitting={isPending}
          onSubmit={onSubmitDot}
          type={dotPopup.mode === "create" ? "create" : "edit"}
          categoryName={dot.name}
        />
      )}

      {/* Delete Category Confirm */}
      <ConfirmDialog
        show={confirmDelCategory}
        title="Are you sure you want to delete this Category?"
        subtitle="The category will be deleted permanently"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={isPending}
        onCancel={() => setConfirmDelCategory(false)}
        onConfirm={() =>
          startTransition(async () => {
            try {
              const res = await deleteDotCategory(dot.id);
              if (!res.success) {
                setErrorMsg(
                  res.message ||
                  "Couldn’t delete the category. Please try again."
                );
                return;
              }
            } catch (e: unknown) {
              const msg = e instanceof Error ? e.message : String(e);
              if (!msg.includes("Unexpected end of JSON input")) {
                setErrorMsg(msg);
                return;
              }
              // treat empty-body parse error as success
            }
            setConfirmDelCategory(false);
            router.refresh();
          })
        }
      />

      {/* Delete Label Confirm */}
      <ConfirmDialog
        show={!!confirmDelLabel}
        title={`Are you sure you want to delete this dot?`}
        subtitle="The dot will be deleted permanently"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={isPending}
        onCancel={() => setConfirmDelLabel(null)}
        onConfirm={() =>
          startTransition(async () => {
            if (!confirmDelLabel) return;
            try {
              const res = await deleteDotLabel(confirmDelLabel.id);
              if (!res.success) {
                setErrorMsg(
                  res.message || "Couldn’t delete the dot. Please try again."
                );
                return;
              }
            } catch (e: unknown) {
              const msg = e instanceof Error ? e.message : String(e);
              if (!msg.includes("Unexpected end of JSON input")) {
                setErrorMsg(msg);
                return;
              }
              // treat empty-body parse error as success
            }
            setConfirmDelLabel(null);
            router.refresh();
          })
        }
      />
      {errorMsg && (
        <ErrorPopup errorText={errorMsg} onClose={() => setErrorMsg(null)} />
      )}
    </div>
  );
}
