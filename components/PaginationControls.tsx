"use client";

import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import scrollToTop from "@/utils/scrollToTop";
import useIsDesktop from "@/hooks/useIsDesktop";
import useWindowWidth from "@/hooks/useWindowWidth";

type Props = {
  curr: number;
  total: number;
  onPageChange?: (p: number) => void;
  containerClassName?: string;
  isTopPagination?: boolean;
};

const PaginationControls = ({ curr, total, onPageChange, containerClassName, isTopPagination = false }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isDesktop = useIsDesktop();
  const windowWidth = useWindowWidth();

  if (isTopPagination && (!isDesktop || windowWidth < 1540)) {
    return null;
  }
  const goTo = (page: number) => {
    const target = Math.max(1, Math.min(total, page));

    if (onPageChange) {
      onPageChange(target);
    } else {
      const sp = new URLSearchParams(searchParams.toString());
      sp.set("page", String(target));
      router.push(`${pathname}?${sp.toString()}`);
    }

    scrollToTop();
  };

  const isCompactRange = windowWidth >= 1680 && windowWidth <= 1840;
  const isUltraCompactRange = windowWidth >= 1540 && windowWidth <= 1679;
  const items = getPaginationItems(curr, total, isDesktop, isCompactRange, isUltraCompactRange);

  const baseBtn =
    "w-[28px] h-[25px] desktop:w-[30px] desktop:h-[30px] rounded-[8px] flex items-center justify-center";
  const numberBtn =
    baseBtn + " text-[12px] leading-none transition-colors select-none";
  const numberBtnIdle =
    numberBtn + " text-dark-black hover:bg-off-white";
  const numberBtnActive =
    numberBtn + " bg-middle-black text-[#f5f5f5]";
  const arrowBtn =
    baseBtn +
    " hover:bg-off-white disabled:opacity-50 disabled:cursor-not-allowed -mr-0.5";

  return (
    <nav aria-label="Pagination" className={`flex items-center gap-4 mt-4 justify-end ${containerClassName}`}>
      <button
        type="button"
        onClick={() => goTo(curr - 1)}
        disabled={curr <= 1}
        aria-label="Previous page"
        className={arrowBtn}
      >
        <PaginationArrow isDisabled={curr <= 1} direction="left" />
      </button>

      {items.map((it, idx) =>
        it === "…" ? (
          <div
            key={`ellipsis-${idx}`}
            className="w-3 h-2 desktop:w-2 desktop:h-2 rounded-lg flex items-center justify-center text-dark-black"
          >
            …
          </div>
        ) : (
          <button
            key={it}
            onClick={() => goTo(it)}
            aria-current={it === curr ? "page" : undefined}
            className={it === curr ? numberBtnActive : numberBtnIdle}
          >
            {it}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => goTo(curr + 1)}
        disabled={curr >= total}
        aria-label="Next page"
        className={arrowBtn}
      >
        <PaginationArrow isDisabled={curr >= total} direction="right" />
      </button>
    </nav>
  );
};

export default PaginationControls;

function getPaginationItems(curr: number, total: number, isDesktop: boolean, isCompactRange: boolean, isUltraCompactRange: boolean): Array<number | "…"> {
  // Ultra-compact mode for 1540-1679px: only show 3 page numbers
  if (isUltraCompactRange) {
    if (total <= 3) return range(1, total);

    // Active page in the middle if both prev and next are available
    if (curr > 1 && curr < total) {
      return [curr - 1, curr, curr + 1];
    }
    // At the start: show first 3 pages
    if (curr === 1) {
      return [1, 2, 3];
    }
    // At the end: show last 3 pages
    return [total - 2, total - 1, total];
  }

  // Compact mode for 1680-1840px: show first, last, and 3 middle digits with ellipsis
  if (isCompactRange) {
    if (total <= 5) return range(1, total);

    const result: Array<number | "…"> = [];
    let middlePages: number[];

    // Determine the 3 middle page numbers
    if (curr > 1 && curr < total) {
      // Active page in the middle if both prev and next are available
      middlePages = [curr - 1, curr, curr + 1];
    } else if (curr === 1) {
      // At the start: show first 3 pages
      middlePages = [1, 2, 3];
    } else {
      // At the end: show last 3 pages
      middlePages = [total - 2, total - 1, total];
    }

    // Add first page if not in middle pages
    if (!middlePages.includes(1)) {
      result.push(1);
      if (middlePages[0] > 2) result.push("…");
    }

    // Add middle pages
    result.push(...middlePages);

    // Add last page if not in middle pages
    if (!middlePages.includes(total)) {
      if (middlePages[2] < total - 1) result.push("…");
      result.push(total);
    }

    return result;
  }

  // Determine how many buttons to show at the start and end
  const isWide = isDesktop;
  const startCount = isWide ? 3 : 2;
  const endCount = isWide ? 2 : 1;
  const minButtons = startCount + endCount + 1; // +1 for ellipsis
  if (total <= minButtons) return range(1, total);

  const pages = new Set<number>();
  // Always show the first N buttons
  for (let i = 1; i <= startCount; i++) pages.add(i);
  // Always show the last M buttons
  for (let i = total - endCount + 1; i <= total; i++) pages.add(i);
  // Always show current, prev, next if in the middle
  [curr - 1, curr, curr + 1].forEach((p) => {
    if (p > startCount && p < total - endCount + 1) pages.add(p);
  });
  const sorted = [...pages].filter(p => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: Array<number | "…"> = [];
  for (let i = 0; i < sorted.length; i++) {
    const p = sorted[i];
    if (i > 0 && p - sorted[i - 1] > 1)
      out.push("…");
    out.push(p);
  }
  return out;
}

function range(start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

const PaginationArrow = ({
  isDisabled,
  direction,
}: {
  isDisabled: boolean;
  direction: "left" | "right";
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    className={direction === "right" ? "rotate-180" : ""}
  >
    <path
      d="M12.6666 8.00065H3.33325M3.33325 8.00065L7.99992 12.6673M3.33325 8.00065L7.99992 3.33398"
      stroke={isDisabled ? "var(--middle-grey)" : "var(--middle-black)"}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
