"use client";

export default function NotFound() {
  return (
    <main className="flex flex-col justify-center items-center h-screen bg-[#f2f2f2]">
      <div className="text-center bg-white px-[270px] rounded-[20px] border border-light-grey pt-[77px] pb-[75px]">
        <p className="text-[26px] font-medium text-light-black">Page not found</p>
        <div className='border-t border-b border-warning-red pt-[29px] px-8 pb-11 mt-1 mb-[61px] '>
          <p className="text-[19px] text-warning-red font-bold">ERROR</p>
          <h1 className=" text-[191px] text-light-black leading-none font-medium flex justify-center ">
            <span>4</span>
            <span>0</span>
            <span>4</span>
          </h1>
        </div>
        <button
          className="text-white bg-light-orange rounded-lg py-2 px-[34px]"
          onClick={() => window.history.back()}
        >
          Go Back
        </button>
      </div>
    </main>
  );
}
