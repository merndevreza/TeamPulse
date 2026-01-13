"use client";
import { OtherUser } from "@/app/actions/api/types";
import { useAllUsers } from "@/app/contexts/AllUsersContext";
import { UsersSearch } from "@/components/Search/Search";
import React, { useEffect } from "react";
import InitialsAvatar from "../Avatar/InitialsAvatar";

const UserList = ({
  allUsers,
  selectedUsers,
  setSelectedUsers,
  showUserList,
  setShowUserList,
}: {
  allUsers: OtherUser[];
  selectedUsers: number[];
  setSelectedUsers: React.Dispatch<React.SetStateAction<number[]>>;
  showUserList: boolean;
  setShowUserList: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { filteredUsers, setAllUsers } = useAllUsers();

  useEffect(() => {
    setAllUsers(allUsers);
  }, [allUsers, setAllUsers]);

useEffect(() => {
    const textField = document.getElementById("text-field-component");
    if (textField) {
      if (showUserList) {
        textField.style.display = "none";
        document.body.style.overflow = "hidden";
      } else {
        textField.style.display = "block";
        document.body.style.overflow = "auto";
      }
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showUserList]);

  useEffect(() => {
    if (selectedUsers.length === 0) {
      setShowUserList(true);
    }
  }, [selectedUsers, setShowUserList]);

  return (
    <div className="h-fit w-full">
      <div
        data-testid="userlist-overlay"
        onClick={() => setShowUserList(false)}
        style={{ display: showUserList ? "block" : "none" }}
        className="h-full w-full bg-[#7d7d7d]/30 fixed top-0 z-2"
      ></div>
      <section
        data-testid="userlist-panel"
        className="top-0 w-[282px] desktop:w-[370px] z-50 h-full bg-off-white fixed flex flex-col"
        style={{
          left: showUserList ? "0" : "-400px",
          transition: "left 0.3s ease-in-out",
        }}
      >
        <div className="flex justify-between items-start desktop:items-center pl-5 desktop:pl-[30px] pr-7 desktop:pr-9.5 pt-5 desktop:pt-7 pb-5.5 desktop:pb-8">
          <div>
            <h2 className="sm:text-[19px] desktop:text-[20px] sm:leading-[29px] desktop:leading-[30px] max-sm:font-medium">Recipients</h2>
            <p className="text-[14px] leading-[17px] text-[#818181] font-inter">
              Select one or more recipients
            </p>
          </div>
          <button
            aria-label="Close recipients list"
            data-testid="userlist-close-btn"
            onClick={() => setShowUserList(!showUserList)}
          >
            <CloseUserListIcon />
          </button>
        </div>
        <div className="max-sm:pb-[25px] pl-4 desktop:pl-7 pb-4 desktop:pb-6">
          <UsersSearch />
        </div>
        <div className="overflow-y-auto flex-1 border-t border-light-grey pb-5" >
          {showUserList &&
            filteredUsers &&
            filteredUsers.map((user) => (
              <button
                data-testid={`user-item-${user.id}`}
                key={user.id}
                className="flex items-center gap-4 pl-3.5 desktop:pl-6 pr-[35px] py-[9px] desktop:py-2 border-b border-[#E6E9ED] max-sm:px-[24px] max-sm:h-12 w-full text-left"
                onClick={() => {
                  setSelectedUsers((prev) => {
                    if (prev.includes(user.id)) {
                      return prev.filter((id) => id !== user.id);
                    } else {
                      if (selectedUsers.length >= 5) {
                        return prev; // Do not add more than 5 users
                      }
                      return [...prev, user.id];
                    }
                  });
                }}
                style={{
                  backgroundColor: selectedUsers.includes(user.id)
                    ? "#f2f2f2"
                    : "transparent",
                }}
              >
                <InitialsAvatar
                  firstName={user.first_name}
                  lastName={user.last_name}
                  className="max-sm:w-8 max-sm:h-8"
                />
                <span className="text-[14px] font-medium translate-y-px font-geist">
                  {user.first_name} {user.last_name}
                </span>
                {selectedUsers.includes(user.id) && (
                  <div className="bg-middle-orange w-5 h-5 flex justify-center items-center ml-auto rounded-md border-2 border-middle-grey">
                    <SelectedRecipientIcon />
                  </div>
                )} 
              </button>
            ))} 
        </div>
      </section>
    </div>
  );
};

export default UserList;

const CloseUserListIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="19"
      height="17"
      viewBox="0 0 19 17"
      fill="none"
      className="max-sm:relative right-[5px] top-[-3px] w-[19px] h-[17px]"
    >
      <path
        d="M17.6406 9.60352C18.1929 9.60352 18.6406 9.1558 18.6406 8.60352C18.6406 8.05123 18.1929 7.60352 17.6406 7.60352V8.60352V9.60352ZM4.99016 7.89641C4.59963 8.28693 4.59963 8.9201 4.99016 9.31062L11.3541 15.6746C11.7446 16.0651 12.3778 16.0651 12.7683 15.6746C13.1589 15.2841 13.1589 14.6509 12.7683 14.2604L7.11148 8.60352L12.7683 2.94666C13.1589 2.55614 13.1589 1.92297 12.7683 1.53245C12.3778 1.14192 11.7446 1.14192 11.3541 1.53245L4.99016 7.89641ZM17.6406 8.60352V7.60352L5.69727 7.60352V8.60352V9.60352L17.6406 9.60352V8.60352Z"
        fill="black"
      />
      <line
        x1="1.88672"
        y1="1.92578"
        x2="1.88672"
        y2="15.2812"
        stroke="black"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};

const SelectedRecipientIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="10"
      viewBox="0 0 12 10"
      fill="none"
    >
      <path
        d="M1.30521 4.34325L4.68463 7.66558L11.0302 0.766327"
        stroke="var(--off-white-2)"
        strokeWidth="2"
      />
    </svg>
  );
};
