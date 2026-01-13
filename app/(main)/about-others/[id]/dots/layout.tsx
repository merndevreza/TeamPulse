import React from "react";

const layout = ({ children } : { children: React.ReactNode }) => {
  return (
    <section>
      <div className="flex items-center desktop:gap-[50px] text-highlight-grey text-[15px] desktop:text-[14px] font-medium mt-2 desktop:mt-4 pt-4.5 desktop:pt-5 pb-2.5 border-t border-light-grey-2 pl-15.5 desktop:pl-9 pr-3 desktop:pr-[50px] max-sm:hidden">
        <div className="w-[165px] desktop:w-[255px]">Subject</div>
        <div className="w-[41vw] pl-5">Content</div>
        <div className="w-[203px] desktop:w-[216px] ml-auto text-center ">Sentiment</div>
      </div>
      {children}
    </section>
  );
};

export default layout;
