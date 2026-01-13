"use client";
import React from "react";
import scrollToTop from "@/utils/scrollToTop";

const SCROLL_THRESHOLD = 300;

const BackToTopBtn = () => {
  const [isVisible, setIsVisible] = React.useState(false);
  React.useEffect(() => {
    const handleScroll = () => {
      const y =
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0;
      setIsVisible(y > SCROLL_THRESHOLD);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="w-full h-max flex justify-end mt-4">
      <button
        onClick={scrollToTop}
        className={`
        fixed bottom-6 right-11 desktop:right-24
        inline-flex items-center gap-2.5
        px-4.5 py-[9px]
        rounded-[10px] border border-middle-grey
        bg-light-grey hover:bg-off-white-2
        text-dark-black text-[14px] font-normal leading-[147%]
        font-inter
        transition-opacity hover:opacity-90
        max-sm:right-6 max-sm:w-[120px] max-sm:px-2.5 max-sm:gap-2 max-sm:py-2
        ${isVisible ? "bottom-6 max-sm:bottom-24" : "-bottom-16"}`}
        style={{
          opacity: isVisible ? 1 : 0,
          pointerEvents: isVisible ? "auto" : "none",
          transition: "opacity 0.3s ease, bottom 0.3s ease",
        }}
      >
        <span>Back to top</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="15"
          height="9"
          viewBox="0 0 15 9"
          fill="none"
        >
          <path
            d="M0.841005 8L6.35866 2.48234C6.76577 2.07523 7.42582 2.07523 7.83293 2.48234L13.3506 8"
            stroke="var(--dark-black)"
            strokeWidth="1.68217"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
};

export default BackToTopBtn;
