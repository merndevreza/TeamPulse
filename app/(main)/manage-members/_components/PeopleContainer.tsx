"use client";
import { UserForAdmin } from "@/app/actions/api/types";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState, useTransition } from "react";
import {
  makeUserAdmin,
  setUserActive,
  deleteAdminUser,
} from "@/app/actions/manage-members/manage-members-api";
import InitialsAvatar from "@/components/Avatar/InitialsAvatar";
import {
  DeactivateSVG,
  DeleteSVG,
  EditSVG,
  MakeAdminSVG,
} from "@/components/CommonSVGs/AdminRouteSVGs";
import HoverTooltip from "@/components/HoverTooltip.tsx/HoverTooltip";
import ErrorPopup from "@/components/ErrorPopup";
import Link from "next/link";
import { cn } from "@/utils/cn";

type Props = {
  users: UserForAdmin[];
  token?: string;
  statusTitle: "Active People" | "Inactive People";
  resultsAsProp?: UserForAdmin[];
};

const PeopleContainer = ({ users, statusTitle, resultsAsProp }: Props) => {
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const [results, setResults] = useState<UserForAdmin[]>(
    resultsAsProp || users
  );
  const [showAdminTooltip, setShowAdminTooltip] = useState<number | null>(null);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpenId(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div
      className="rounded-[10px] bg-off-white px-11 pt-0 pb-7.5 max-sm:px-4"
      style={{
        boxShadow: "0 18px 31px 0 rgba(0, 0, 0, 0.12)",
      }}
    >
      <div className="pl-8 pt-2 pb-[7px] flex justify-between border-b border-light-grey-2 items-center max-sm:pl-0">
        <span className="text-[14px] text-dark-grey">{statusTitle}</span>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(560px,1fr))] gap-x-[150px] max-[1032px]:grid-cols-1">
        {(results.length ? results : users).map((user) => (
          <div key={user.id} className="relative">
            <div
              className="pl-6.5 pr-6 max-sm:px-0 max-sm:py-0 pt-1.5 pb-[7px] max-sm:h-12 flex justify-between items-center border-b border-light-grey-2
              max-sm:pr-5"
              style={{
                backgroundColor:
                  menuOpenId === user.id ? "var(--light-grey)" : "transparent",
              }}
            >
              {statusTitle !== "Inactive People" ? (
                <Link href={`/about-others/${user.id}/summary`} className="flex items-center gap-[18px] relative">
                  <User user={user} showAdminTooltip={showAdminTooltip} setShowAdminTooltip={setShowAdminTooltip} />
                </Link>
              ) : (
                <div className="flex items-center gap-[18px] relative">
                  <User user={user} showAdminTooltip={showAdminTooltip} setShowAdminTooltip={setShowAdminTooltip} />
                </div>
              )}

              <button
                className="bg-light-grey rounded-lg w-9 h-9 flex justify-center items-center max-sm:h-9 max-sm:w-9 max-sm:text-xl"
                aria-haspopup="menu"
                aria-expanded={menuOpenId === user.id}
                onClick={() =>
                  setMenuOpenId(menuOpenId !== user.id ? user.id : null)
                }
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="4" viewBox="0 0 15 4" fill="none">
                  <path d="M0 1.66667C0 0.746192 0.746193 0 1.66667 0C2.58714 0 3.33333 0.746193 3.33333 1.66667C3.33333 2.58714 2.58714 3.33333 1.66667 3.33333C0.746193 3.33333 0 2.58714 0 1.66667Z" fill="#6D6B6B" />
                  <path d="M5.83333 1.66667C5.83333 0.746192 6.57953 0 7.5 0C8.42048 0 9.16667 0.746193 9.16667 1.66667C9.16667 2.58714 8.42048 3.33333 7.5 3.33333C6.57953 3.33333 5.83333 2.58714 5.83333 1.66667Z" fill="#6D6B6B" />
                  <path d="M13.3333 0C12.4129 0 11.6667 0.746192 11.6667 1.66667C11.6667 2.58714 12.4129 3.33333 13.3333 3.33333C14.2538 3.33333 15 2.58714 15 1.66667C15 0.746193 14.2538 0 13.3333 0Z" fill="#6D6B6B" />
                </svg>
              </button>
            </div>

            <ActionsPopup
              user={user}
              open={menuOpenId === user.id}
              onClose={() => setMenuOpenId(null)}
              onUpdated={(u) => {
                setResults((r) => r.map((x) => (x.id === u.id ? u : x)));
              }}
              onDeleted={(id) => {
                setResults((r) => r.filter((x) => x.id !== id));
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PeopleContainer;

const getActionPaddingClasses = (action: "edit" | "make_admin" | "deactivate" | "activate" | "delete"): string => {
  switch (action) {
    case "activate":
    case "deactivate":
      return "pt-2 pb-[7px]";
    case "delete":
      return "pt-3 pb-2.5";
    case "edit":
      return "pt-2.5 pb-[11px]";
    case "make_admin":
    default:
      return "pt-2.5 pb-2.5";
  }
};

interface UserProps {
  user: UserForAdmin;
  showAdminTooltip: number | null;
  setShowAdminTooltip: (id: number | null) => void;
}
const User = ({ user, showAdminTooltip, setShowAdminTooltip }: UserProps) => {
  return (
    <>
      <div
        className="cursor-default"
        onPointerEnter={() =>
          setShowAdminTooltip(user.role === "admin" ? user.id : null)
        }
        onPointerLeave={() => setShowAdminTooltip(null)}
      >
        <InitialsAvatar
          firstName={user.first_name}
          lastName={user.last_login}
          isAdmin={user.role === "admin"}
          className="max-sm:h-8 max-sm:w-8"
        />
      </div>
      <HoverTooltip
        show={showAdminTooltip === user.id}
        content={"Admin user"}
        tipX={30}
        containerX={-20}
        containerY={25}
      />
      <p
        id={`input-${user.id}`}
        className="text-dark-black text-[14px] max-sm:text-[16px]"
      >
        {user.first_name} {user.last_name}
      </p>
    </>)
    ;
};
const ActionsPopup = ({
  user,
  open,
  onClose,
  onUpdated,
  onDeleted,
}: {
  user: UserForAdmin;
  open: boolean;
  onClose: () => void;
  onUpdated: (u: UserForAdmin) => void;
  onDeleted: (id: number) => void;
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [confirm, setConfirm] = useState<
    "make_admin" | "deactivate" | "activate" | "delete" | null
  >(null);
  const [editing, setEditing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Reset transient state on open/close
  useEffect(() => {
    if (!open) {
      setConfirm(null);
      setEditing(false);
      setErrorMsg(null);
    }
  }, [open, user.first_name, user.last_name]);

  // Close on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (
        open &&
        ref.current &&
        !ref.current.contains(e.target as Node) &&
        !(e.target as HTMLElement).closest(".confirmation-popup")
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open, onClose]);

  // Close on Escape (for the menu; the Confirm dialog handles its own Escape)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const actions = [
    { name: editing ? "Save" : "Edit user", action: "edit" as const },
    { name: "Make admin", action: "make_admin" as const },
    {
      name: user.is_active ? "Deactivate user" : "Activate user",
      action: user.is_active ? ("deactivate" as const) : ("activate" as const),
    },
    { name: "Delete user", action: "delete" as const },
  ];

  return (
    <>
      <div
        ref={ref}
        className="popup absolute top-5 right-2 w-[235px] bg-off-white border border-light-grey-2 rounded-lg shadow-lg z-10"
        role="menu"
        style={{ display: open ? "block" : "none" }}
      >
        {actions.map((a, i) => {
          const isFirst = i === 0;
          const isLast = i === actions.length - 1;
          const isDestructive = a.action === "delete";
          const isPrimary = a.action === "edit";
          return (
            <button
              key={a.action}
              style={{
                display:
                  user.role === "admin" ||
                    !user.is_active ||
                    user.role === "system"
                    ? a.action === "make_admin"
                      ? "none"
                      : undefined
                    : undefined,
              }}
              className={cn(`px-7 bg-off-white w-full text-left border-b border-b-light-grey-2 hover:bg-light-grey disabled:opacity-60 disabled:cursor-not-allowed ${isFirst ? "rounded-t-lg" : isLast ? "rounded-b-lg" : ""
                } ${isDestructive ? "text-warning-red" : ""} ${isPrimary ? "font-medium" : ""
                } ${getActionPaddingClasses(a.action)}`)}
              role="menuitem"
              disabled={isPending}
              onClick={
                a.action === "edit"
                  ? async () => {
                    const qs = new URLSearchParams({
                      id: String(user.id),
                      first_name: user.first_name,
                      last_name: user.last_name,
                      email: user.email,
                      role: user.role,
                    }).toString();
                    router.push(`/manage-members/edit-member?${qs}`);
                    onClose();
                  }
                  : () => setConfirm(a.action)
              }
            >
              <div className="flex items-center gap-[9px] text-[14px]">
                <div className={`w-1/5 ${(a.action === "deactivate" || a.action === "activate") ? "-translate-x-1.5 " : "-translate-x-0.5 "}`}>
                  {a.action === "edit" && <EditSVG />}
                  {a.action === "make_admin" && <MakeAdminSVG />}
                  {(a.action === "deactivate" || a.action === "activate") && (
                    <DeactivateSVG />
                  )}
                  {a.action === "delete" && <DeleteSVG fill="#E2333F" />}
                </div>
                <span>
                  {isPending && confirm === a.action ? "Working…" : a.name}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {confirm && open && (
        <ConfirmationPopup
          message={`Are you sure you want to ${confirm} this user?`}
          onConfirm={() => {
            setErrorMsg(null);
            startTransition(async () => {
              try {
                if (confirm === "make_admin") {
                  const res = await makeUserAdmin(user.id);
                  if (!res.success || !res.data) {
                    setErrorMsg(res.message || "Failed to make admin.");
                  } else {
                    onUpdated(res.data);
                  }
                } else if (confirm === "deactivate" || confirm === "activate") {
                  const res = await setUserActive(
                    user.id,
                    confirm === "activate"
                  );
                  if (!res.success || !res.data) {
                    setErrorMsg(res.message || "Failed to update status.");
                  } else {
                    onUpdated(res.data);
                  }
                } else if (confirm === "delete") {
                  const res = await deleteAdminUser(user.id);
                  if (!res.success) {
                    setErrorMsg(res.message || "Failed to delete user.");
                  } else {
                    onDeleted(user.id);
                  }
                }
              } catch (err) {
                console.error("Error updating user:", err);
                setErrorMsg("Unexpected error performing action.");
              } finally {
                setConfirm(null);
                onClose();
              }
            });
          }}
          onCancel={() => setConfirm(null)}
        />
      )}

      {errorMsg && (
        <ErrorPopup
          errorText={errorMsg}
          onClose={() => {
            setErrorMsg(null);
          }}
        />
      )}
    </>
  );
};

const ConfirmationPopup = ({
  message,
  onConfirm,
  onCancel,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  const cancelRef = React.useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel]);

  // detect delete intent
  const isDelete = message.toLowerCase().includes("delete");

  if (isDelete) {
    return (
      <div
        className="confirmation-popup fixed inset-0 z-50 flex items-center justify-center
        "
        role="dialog"
        aria-modal="true"
      >
        <div className="absolute inset-0 bg-black/20 z-0" onClick={onCancel} />
        <div
          className="relative z-10 bg-off-white desktop:pt-7 px-8 pb-10 rounded-xl shadow-xl min-w-[320px] max-w-[400px] desktop:max-w-[527px] max-sm:w-[308px] max-sm:px-4 max-sm:py-8
          "
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-[28px] text-center font-medium mb-7.5 text-dark-black max-sm:mb-6">
            Delete
          </h2>

          <div
            className="rounded-md border border-light-grey-2 bg-off-white text-dark-black text-[14px] desktop:text-[17px] px-5 pt-5 pb-7.5 mb-8
          max-sm:text-[16px] font-inter max-sm:mb-6
          "
          >
            If you delete this person, all the information is going to be deleted permanently. You will just be able to see the date the user was deleted.
          </div>

          <p
            className="text-[16px] desktop:text-[20px] font-medium text-dark-black mb-4 pl-3 max-sm:text-[14px] max-sm:text-dark-grey max-sm:w-full"
          >
            Are you sure you want to delete this user?
          </p>

          <div className="flex justify-center gap-5">
            <button
              ref={cancelRef}
              className="px-[33px] py-2 bg-background-grey hover:bg-gray-300 rounded-[10px]
              max-sm:h-8 max-sm:text-[16px] max-sm:py-1 max-sm:rounded-lg max-sm:px-8 desktop:text-[17px] font-inter text-light-black"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              className="px-[33px] py-2 bg-warning-red hover:bg-red-700 rounded-[10px]
              max-sm:h-8 max-sm:text-[16px] max-sm:py-1 max-sm:rounded-lg max-sm:px-8 desktop:text-[17px] font-inter text-off-white"
              onClick={onConfirm}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  }

  // fallback: keep old look for other actions
  return (
    <div
      className="confirmation-popup fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/20 z-0" onClick={onCancel} />
      <div
        className="relative z-10 bg-off-white p-6 rounded-lg shadow-lg min-w-80"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="mb-4">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            ref={cancelRef}
            className="px-4 py-2 bg-light-grey-3 hover:bg-gray-300 rounded-[10px]"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-warning-red hover:bg-red-700 text-white rounded-[10px]"
            onClick={onConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
