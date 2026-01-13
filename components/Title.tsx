import React from "react";

const Title = ({
  first_name = "John",
  last_name = "Doe",
  className = "",
}: {
  first_name?: string;
  last_name?: string;
  className?: string;
}) => {
  return (
    <div className={`${className}`}>
      <h1 className="font-medium text-dark-black text-[23px] desktop:text-[28px] leading-9 max-sm:px-3 inline-flex w-max">
        {first_name} {last_name}
      </h1>
    </div>
  );
};

export default Title;
