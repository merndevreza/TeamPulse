"use client";
import { updateMyPassword } from "@/app/actions/my-profile/update-my-password";
import Button from "@/components/Button";
import InputPassword from "@/components/Form/InputPassword";
import PasswordChecker from "@/components/Form/PasswordChecker";
import useActionState from "@/hooks/useActionState";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";

// Constants for error messages
const CLIENT_SIDE_ERRORS = {
  PASSWORD_SAME: "New password must be different from current password.",
  PASSWORDS_NOT_MATCH: "New passwords do not match.",
  INVALID_FIELDS: "Please ensure all password fields are valid.",
  INVALID_OLD_PASSWORD: "Invalid old password",
} as const;

// Helper function to check if error is a client-side validation error
const isClientSideValidationError = (errorMessage: string): boolean => {
  return (
    errorMessage === CLIENT_SIDE_ERRORS.PASSWORD_SAME ||
    errorMessage === CLIENT_SIDE_ERRORS.PASSWORDS_NOT_MATCH ||
    errorMessage === CLIENT_SIDE_ERRORS.INVALID_FIELDS
  );
};

const UpdatePassword = () => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState<string | null>(null);
  const [isValid, setIsValid] = useState({
    isValidCurrentPassword: false,
    isValidNewPassword: false,
    isValidConfirmPassword: false,
  });
  const { setActionRunning, clearActionRunning } = useActionState();

  // Refs to store timeout IDs for cleanup
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const successTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setErrorWithTimeout = useCallback((message: string, timeout = 5000) => {
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }

    setErrorMessage(message);
    errorTimeoutRef.current = setTimeout(() => {
      setErrorMessage("");
      errorTimeoutRef.current = null;
    }, timeout);
  }, []);

  const setSuccessWithTimeout = useCallback(
    (message: string, timeout = 5000) => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }

      setSuccess(message);
      successTimeoutRef.current = setTimeout(() => {
        setSuccess(null);
        successTimeoutRef.current = null;
      }, timeout);
    },
    []
  );

  // Cleanup timeouts on component unmount
  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  // Validate passwords in real-time
  useEffect(() => {
    // Only clear client-side validation errors, not server-side errors
    const isClientSideError = isClientSideValidationError(errorMessage);

    // Clear any existing client-side error first
    if (
      isClientSideError &&
      (!currentPassword ||
        !newPassword ||
        (currentPassword !== newPassword && newPassword === confirmPassword))
    ) {
      setErrorMessage("");
    }

    // Check if new password is same as current password
    if (currentPassword && newPassword && currentPassword === newPassword) {
      setErrorMessage(CLIENT_SIDE_ERRORS.PASSWORD_SAME);
      return;
    }

    // Check if passwords don't match
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      setErrorMessage(CLIENT_SIDE_ERRORS.PASSWORDS_NOT_MATCH);
      return;
    }

    // Check if all fields are invalid
    if (
      currentPassword &&
      newPassword &&
      confirmPassword &&
      (!isValid.isValidNewPassword ||
        !isValid.isValidConfirmPassword ||
        !isValid.isValidCurrentPassword)
    ) {
      setErrorMessage(CLIENT_SIDE_ERRORS.INVALID_FIELDS);
      return;
    }
  }, [currentPassword, newPassword, confirmPassword, isValid, errorMessage]);

  // Determine which fields should show error styling
  const getFieldErrors = () => {
    const errors = {
      currentPasswordError: false,
      newPasswordError: false,
      confirmPasswordError: false,
    };

    if (errorMessage === CLIENT_SIDE_ERRORS.PASSWORD_SAME) {
      errors.currentPasswordError = true;
      errors.newPasswordError = true;
    } else if (errorMessage === CLIENT_SIDE_ERRORS.PASSWORDS_NOT_MATCH) {
      errors.newPasswordError = true;
      errors.confirmPasswordError = true;
    } else if (errorMessage === CLIENT_SIDE_ERRORS.INVALID_FIELDS) {
      errors.currentPasswordError = !isValid.isValidCurrentPassword;
      errors.newPasswordError = !isValid.isValidNewPassword;
      errors.confirmPasswordError = !isValid.isValidConfirmPassword;
    } else if (errorMessage === CLIENT_SIDE_ERRORS.INVALID_OLD_PASSWORD) {
      // Server-side error for incorrect current password
      errors.currentPasswordError = true;
    }

    return errors;
  };

  const fieldErrors = getFieldErrors();

  const clearForm = React.useCallback(() => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setErrorMessage("");
    setSuccess(null);

    // Clear any active timeouts
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = null;
    }
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
      successTimeoutRef.current = null;
    }
  }, []);

  const handleSave = async () => {
    // Only prevent save for client-side validation errors, not server-side errors
    const isClientSideError = isClientSideValidationError(errorMessage);

    if (errorMessage && isClientSideError) {
      return;
    }

    if (isLoading) return;

    // Clear previous messages
    setErrorMessage("");
    setSuccess(null);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("old_password", currentPassword);
      formData.append("new_password", newPassword);
      formData.append("confirm_password", confirmPassword);

      const result = await updateMyPassword(formData);

      if (!result.success) {
        // Handle authentication errors
        if (result.shouldClearAuth) {
          setErrorWithTimeout(
            "Your session has expired. Redirecting to login...",
            2000
          );
          setTimeout(() => {
            router.push("/");
          }, 2000);
          return;
        }
        setErrorWithTimeout(
          result.message || "Failed to update password. Please try again."
        );
        return;
      }

      setSuccessWithTimeout("Password updated successfully!");

      clearForm();

      setTimeout(() => {
        setIsEditing(false);
      }, 3000);
    } catch (error) {
      console.error("Unexpected error in handleSave:", error);
      setErrorWithTimeout("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
      clearActionRunning();
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    clearForm();
    clearActionRunning();
  };
  const makeDisabled =
    isLoading ||
    !currentPassword ||
    !newPassword ||
    !confirmPassword ||
    !isValid.isValidCurrentPassword ||
    !isValid.isValidNewPassword ||
    !isValid.isValidConfirmPassword ||
    currentPassword === newPassword ||
    newPassword !== confirmPassword ||
    // Only disable for client-side validation errors, not server-side errors
    (!!errorMessage && isClientSideValidationError(errorMessage));

  return (
    <>
      {!isEditing ? (
        <div className="max-sm:w-full max-sm:flex justify-center max-sm:mt-1.5">
          <button
            className="underline text-highlight-blue max-sm:m-auto max-sm:w-[109px] text-[16px] desktop:text-[17px] font-medium ml-7 cursor-pointer"
            onClick={() => {
              setIsEditing(true);
              setActionRunning("Editing Password");
            }}
          >
            Edit Password
          </button>
        </div>
      ) : (
        <section className="bg-off-white p-[30px] max-sm:py-11 max-sm:px-6 rounded-[10px] w-full max-w-[1096px] shadow-custom">
          <h4 className="hidden max-sm:block text-xl leading-1.5 font-medium mb-10">Edit Password</h4>
          <div className="flex justify-between items-start">
            <InputPassword
              wrapperClass="md:w-2/3 lg:w-1/2 max-sm:pr-0 pr-[10px]"
              password={currentPassword}
              setPassword={setCurrentPassword}
              placeholder=""
              id="current-password"
              onValidationChange={(isValid) => {
                setIsValid((prev) => ({
                  ...prev,
                  isValidCurrentPassword: isValid,
                }));
              }}
              inputClass="max-sm:h-[46px] max-sm:pl-[14px] max-sm:text-[16px]"
              labelClass="text-dark-grey max-sm:pl-0 max-sm:text-[#6C7278] max-sm:mb-1 max-sm:text-[14px]"
              hasError={fieldErrors.currentPasswordError}
              showMissingRequirements={true}
            />
            <div className="max-sm:hidden flex flex-col lg:flex-row gap-5 mt-5">
              <Button
                variant="secondary"
                type="button"
                text="Cancel"
                onClick={handleCancel}
              />
              <Button
                variant="primary"
                type="button"
                text="Save"
                disabled={makeDisabled}
                onClick={handleSave}
              />
            </div>
          </div>
          <div className="flex flex-col lg:flex-row w-full max-sm:gap-2 gap-5 max-sm:my-2 my-5">
            <InputPassword
              password={newPassword}
              setPassword={setNewPassword}
              placeholder=""
              labelText="New password"
              id="new-password"
              onValidationChange={(isValid) => {
                setIsValid((prev) => ({
                  ...prev,
                  isValidNewPassword: isValid,
                }));
              }}
              labelClass="text-dark-grey max-sm:pl-0 max-sm:text-[#6C7278] max-sm:mb-1 max-sm:text-[14px]"
              inputClass="max-sm:h-[46px] max-sm:pl-[14px] max-sm:text-[16px]"
              hasError={fieldErrors.newPasswordError}
            />
            <InputPassword
              password={confirmPassword}
              setPassword={setConfirmPassword}
              placeholder=""
              inputClass="max-sm:h-[46px] max-sm:pl-[14px] max-sm:text-[16px]"
              labelText="Repeat new password"
              id="confirm-password"
              onValidationChange={(isValid) => {
                setIsValid((prev) => ({
                  ...prev,
                  isValidConfirmPassword: isValid,
                }));
              }}
              disabled={!isValid.isValidNewPassword}
              labelClass="text-dark-grey max-sm:pl-0 max-sm:text-[#6C7278] max-sm:mb-1 max-sm:text-[14px]"
              hasError={fieldErrors.confirmPasswordError}
            />
          </div>
          <PasswordChecker password={newPassword} />
          <div className="hidden max-sm:flex justify-center gap-3 mt-5">
            <Button
              variant="secondary"
              type="button"
              text="Cancel"
              onClick={handleCancel}
              className="max-sm:h-9 max-sm:w-[114px] max-sm:text-[16px]"
            />
            <Button
              variant="primary"
              type="button"
              text="Save"
              disabled={makeDisabled}
              onClick={handleSave}
              className="max-sm:h-9 max-sm:w-28 max-sm:text-[16px]"
            />
          </div>
          {(errorMessage || success) && (
            <div
              className={`mt-4 p-3 rounded-md ${
                errorMessage
                  ? "bg-red-50 border border-red-200 text-red-800"
                  : "bg-green-50 border border-green-200 text-green-800"
              }`}
            >
              {errorMessage || success}
            </div>
          )}
        </section>
      )}
    </>
  );
};

export default UpdatePassword;
