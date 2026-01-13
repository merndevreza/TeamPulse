"use client";
import CrossIcon from "@/app/(main)/_components/icons/CrossIcon";
import React, { useEffect, useState } from "react";
import HeaderSelected from "./HeaderSelected";
import SinglePerson from "@/app/(main)/_components/icons/SinglePerson";
import { useRouter } from "next/navigation";

const TEXT_COLOR = "#6B6B6B";

const Header = ({
  selectedUsers = [],
  selectedDots = [],
  setSelectedUsers = () => { },
  showUserList = false,
  setShowUserList = () => { },
  type = "give",
  setConfirmLeave = () => { },
  showTextFieldForTouchscreen = false,
}: {
  selectedUsers?: number[];
  selectedDots?: { label_id: number }[];
  setSelectedUsers?: React.Dispatch<React.SetStateAction<number[]>>;
  showUserList?: boolean;
  setShowUserList?: React.Dispatch<React.SetStateAction<boolean>>;
  type?: "give" | "edit";
  setConfirmLeave?: React.Dispatch<React.SetStateAction<boolean>>;
  showTextFieldForTouchscreen?: boolean;
}) => {
  const router = useRouter();
  const [scrollDirection, setScrollDirection] = useState<"up" | "down">("down");
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      // Only apply scroll behavior on mobile
      if (window.innerWidth >= 769) return;

      if (showTextFieldForTouchscreen) {
        // header visible if text field is open
        setScrollDirection("down");
        return;
      }

      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          if (currentScrollY <= 30) {
            // At top of page, show header
            setScrollDirection("down");
          } else if (currentScrollY > lastScrollY && currentScrollY > 30) {
            // Scrolling down
            setScrollDirection("down");
          } else if (currentScrollY < lastScrollY) {
            // Scrolling up
            setScrollDirection("up");
          }

          setLastScrollY(currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, showTextFieldForTouchscreen]);

  const handleCloseClick = () => {
    if (type === "edit") {
      router.push("/about-me/summary");
      return;
    }
    // give mode
    if (selectedUsers.length > 0 && selectedDots.length > 0) {
      setConfirmLeave(true);
    } else {
      router.push("/about-me/summary");
    }
  };

  return (
    <header
      data-testid="header-root"
      data-mode={type}
      className={`h-[37px] desktop:h-14 w-full pl-4 desktop:pl-7 pr-4 desktop:pr-8 max-sm:px-3 flex items-center justify-between z-40 relative bg-light-black max-sm:h-[50px] max-sm:fixed max-sm:transition-all max-sm:duration-300 rounded-b ${scrollDirection === "up" ? "max-sm:top-[-50px]" : "max-sm:top-0"
        }`}
      style={{ color: TEXT_COLOR }}
    >
      {type === "give" ? (
        <div
          data-testid="header-give"
          className={`h-full flex items-center gap-3 desktop:gap-4 text-black font-medium ${selectedUsers.length === 0 ? "desktop:pl-3" : ""}`}
        >
          {/* add recipient for mobile */}
          {!showUserList && (
            <button
              aria-label="Add user"
              onClick={() => {
                setShowUserList(true);
              }}
              className="max-sm:block hidden"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="16"
                viewBox="0 0 18 16"
                fill="none"
              >
                <path
                  d="M1 6.67773C0.447715 6.67773 -4.82823e-08 7.12545 0 7.67773C4.82823e-08 8.23002 0.447715 8.67773 1 8.67773L1 7.67773L1 6.67773ZM13.6505 8.38484C14.041 7.99432 14.041 7.36115 13.6505 6.97063L7.2865 0.606666C6.89598 0.216142 6.26282 0.216142 5.87229 0.606666C5.48177 0.997191 5.48177 1.63036 5.87229 2.02088L11.5291 7.67773L5.87229 13.3346C5.48177 13.7251 5.48177 14.3583 5.87229 14.7488C6.26282 15.1393 6.89598 15.1393 7.28651 14.7488L13.6505 8.38484ZM1 7.67773L1 8.67773L12.9434 8.67773L12.9434 7.67773L12.9434 6.67773L1 6.67773L1 7.67773Z"
                  fill="#F2F2F2"
                />
                <line
                  x1="16.7539"
                  y1="14.3555"
                  x2="16.7539"
                  y2="1"
                  stroke="#F2F2F2"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}
          {selectedUsers.length > 0 && (
            <HeaderSelected
              selectedUsers={selectedUsers}
              setSelectedUsers={setSelectedUsers}
              showUserList={showUserList}
            />
          )}
          {!showUserList && (
            <>
              <button
                data-testid="add-recipient-btn"
                className={`bg-off-white rounded-3xl text-middle-orange flex items-center gap-3 desktop:gap-3.5 max-sm:hidden ${selectedUsers.length === 0 ? "pl-[18px] pr-[17px] desktop:pr-3.5 py-0.5 desktop:py-2" : "p-[5.5px] desktop:p-[9px]"}`}
                aria-label="Add user"
                onClick={() => {
                  setShowUserList(true);
                }}
              >
                {selectedUsers.length === 0 && <span>Add recipient</span>}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="19"
                  height="20"
                  viewBox="0 0 19 20"
                  fill="none"
                  className="w-4 h-4 desktop:w-5 desktop:h-5"
                >
                  <path
                    d="M18.3867 9.99609C18.3867 10.5484 17.939 10.9961 17.3867 10.9961L10.1904 10.9961L10.1904 18.1934C10.1902 18.7453 9.74236 19.1931 9.19043 19.1934C8.63829 19.1934 8.19067 18.7454 8.19043 18.1934L8.19043 10.9961L1 10.9961C0.447721 10.9961 -4.25825e-07 10.5484 -4.01684e-07 9.99609C3.20474e-05 9.44384 0.447742 8.9961 1 8.99609L8.19043 8.99609L8.19043 1.80664C8.19043 1.25436 8.63814 0.80664 9.19043 0.80664C9.74251 0.806884 10.1904 1.25451 10.1904 1.80664L10.1904 8.99609L17.3867 8.99609C17.939 8.99609 18.3867 9.44384 18.3867 9.99609Z"
                    fill="var(--middle-orange)"
                  />
                </svg>
              </button>
              <div className="text-[15px] desktop:text-[20px] text-off-white border-l-2 border-light-grey/40 pl-2.5 desktop:pl-4 py-0.5 desktop:py-[3px] ">
                Give Dot
              </div>
            </>
          )}
        </div>
      ) : (
        <div
          data-testid="header-edit"
          className="h-full flex items-center gap-2 lg:gap-4 text-black lg:text-[22px] font-medium"
        >
          <SinglePerson className="max-sm:w-8 max-sm:h-8" />
          <div className="text-[20px] text-off-white border-l-2 border-light-grey/40 pl-3 max-sm:text-[18px] max-sm:pt-1 max-sm:h-9">
            Edit Dot
          </div>
        </div>
      )}
      <div>
        <button
          data-testid="close-link"
          aria-label="Close and leave page"
          role="link"
          onClick={handleCloseClick}
          className="p-1"
        >
          <CrossIcon />
        </button>
      </div>
    </header>
  );
};

export default Header;
