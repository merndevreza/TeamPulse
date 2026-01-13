 const scrollToTop = () => {
    // Root (browser) scroll
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Fallback: documentElement/body
    (document.scrollingElement || document.documentElement)?.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    // If your layout uses a custom scroll container
    const candidates = document.querySelectorAll(
      '.overflow-y-auto, [data-scroll-container]'
    );
    candidates.forEach((el) => {
      if (el.scrollTop > 0) {
        el.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  };

  export default scrollToTop;