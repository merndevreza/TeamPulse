"use client";
import { updateMyProfile } from "@/app/actions/my-profile/update-my-profile";
import Avatar from "@/components/Avatar/Avatar";
import Button from "@/components/Button";
import InputFirstName from "@/components/Form/InputFirstName";
import InputLastName from "@/components/Form/InputLastName";
import React from "react";
import { useRouter } from "next/navigation";
import useActionState from "@/hooks/useActionState";

interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

const UpdateAvatarAndName = ({ profile }: { profile: UserProfile }) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [firstName, setFirstName] = React.useState(profile.first_name);
  const [lastName, setLastName] = React.useState(profile.last_name);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [isValid, setIsValid] = React.useState({
    isValidFirstName: true,
    isValidLastName: true,
  });
  const { setActionRunning, clearActionRunning } = useActionState();

  const handleSave = async () => {
    if (isLoading) return;

    // Clear previous messages
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      // Validate input on client side
      const trimmedFirstName = firstName.trim();
      const trimmedLastName = lastName.trim();

      if (!trimmedFirstName && !trimmedLastName) {
        setError("Please provide at least one name field.");
        return;
      }

      if (!isValid.isValidFirstName || !isValid.isValidLastName) {
        setError("Please fix the validation errors before saving.");
        return;
      }

      const formData = new FormData();
      if (trimmedFirstName) formData.append("first_name", trimmedFirstName);
      if (trimmedLastName) formData.append("last_name", trimmedLastName);

      const result = await updateMyProfile(formData);

      if (!result.success) {
        console.error("Failed to update profile:", result.message);

        // Handle authentication errors
        if (result.shouldClearAuth) {
          setError("Your session has expired. Redirecting to login...");
          setTimeout(() => {
            router.push("/");
          }, 2000);
          return;
        }

        setError(
          result.message || "Failed to update profile. Please try again."
        );
        return;
      }

      // Success - update local state and show success message
      if (result.data) {
        setFirstName(result.data.first_name);
        setLastName(result.data.last_name);
      }

      setSuccess("Profile updated successfully!");
      setIsEditing(false);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error("Unexpected error updating profile:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
      clearActionRunning();
    }
  };

  const handleCancel = () => {
    // Revert changes and clear messages
    setFirstName(profile.first_name);
    setLastName(profile.last_name);
    setIsEditing(false);
    setError(null);
    setSuccess(null);
    clearActionRunning();
  };

  const handleEditStart = () => {
    setIsEditing(true);
    setError(null);
    setSuccess(null);
    setActionRunning("Editing Profile");
  };

  return (
    <section className="bg-off-white p-[30px] max-sm:py-8 max-sm:px-6 rounded-[10px] w-full max-w-[1096px] max-sm:mb-4 mb-8 shadow-custom">
      <div className="flex justify-between items-start max-sm:items-center gap-3">
        <Avatar
          size="xl"
          placeholderLetter={`${firstName.charAt(0)}${lastName.charAt(0)}`}
          className="max-sm:m-auto"
        />
        <div className="max-sm:hidden flex flex-col lg:flex-row gap-3 mt-[18px]">
          {isEditing ? (
            <>
              <Button
                variant="secondary"
                type="button"
                text="Cancel"
                onClick={handleCancel}
                disabled={isLoading}
              />
              <Button
                variant="primary"
                type="button"
                text={isLoading ? "Saving..." : "Save"}
                onClick={handleSave}
                disabled={isLoading}
              />
            </>
          ) : (
            <Button
              variant="secondary"
              className="text-middle-orange"
              type="button"
              text="Edit"
              onClick={handleEditStart}
            />
          )}
        </div>
      </div>
      <div className="flex  flex-col lg:flex-row w-full gap-5 max-sm:gap-3 mt-9 max-sm:mt-7">
        {isEditing ? (
          <>
            <InputFirstName
              firstName={firstName}
              setFirstName={setFirstName}
              onValidationChange={(isValid) => {
                setIsValid((prev) => ({ ...prev, isValidFirstName: isValid }));
              }}
              wrapperClass="w-full"
              labelClass="max-sm:text-[#6C7278] text-[16px] max-sm:text-[14px] desktop:text-[17px] font-medium text-dark-grey max-sm:mb-1 mb-2 pl-[18px]"
              inputClass="px-5 py-2 text-dark-grey-3"
              disabled={isLoading}
              maxLength={30}
              required={false}
            />
            <InputLastName
              lastName={lastName}
              setLastName={setLastName}
              onValidationChange={(isValid) => {
                setIsValid((prev) => ({ ...prev, isValidLastName: isValid }));
              }}
              wrapperClass="w-full"
              labelClass="text-[16px] desktop:text-[17px] font-medium text-dark-grey max-sm:mb-1 mb-2 pl-[18px]"
              inputClass="px-5 py-2 text-dark-grey-3"
              disabled={isLoading}
              maxLength={30}
              required={false}
            />
          </>
        ) : (
          <>
            <div className="w-full">
              <label
                htmlFor="first_name"
                className="max-sm:text-[#6C7278] max-sm:pl-0 text-[16px] max-sm:text-[14px] desktop:text-[17px] font-medium text-dark-grey max-sm:mb-1 mb-2 pl-[18px] block"
              >
                First Name
              </label>
              <input
                className="outline-none px-5 py-2 text-dark-grey-3 rounded-md w-full max-sm:text-[16px] max-sm:pl-3.5 max-sm:h-[46px] text-[15px] desktop:text-[18px] bg-background-grey"
                type="text"
                name="first_name"
                id="first_name"
                value={firstName}
                autoComplete="given-name"
                disabled={true}
                readOnly
              />
            </div>
            <div className="w-full">
              <label
                htmlFor="last_name"
                className="max-sm:text-[#6C7278] text-[16px] max-sm:pl-0 max-sm:text-[14px] desktop:text-[17px] font-medium text-dark-grey max-sm:mb-1 mb-2 pl-[18px] block"
              >
                Last Name
              </label>
              <input
                className="outline-none px-5 py-2 text-dark-grey-3 rounded-md w-full text-[15px] desktop:text-[18px] max-sm:text-[16px] max-sm:pl-3.5 max-sm:h-[46px] bg-background-grey"
                type="text"
                name="last_name"
                id="last_name"
                value={lastName}
                autoComplete="family-name"
                disabled={true}
                readOnly
              />
            </div>
          </>
        )}
      </div>
      <div className="hidden max-sm:flex flex-col lg:flex-row gap-3 mt-7">
        {isEditing ? (
          <div className="max-sm:flex justify-center gap-3">
            <Button
              variant="secondary"
              type="button"
              text="Cancel"
              className="max-sm:h-9 max-sm:w-[114px] max-sm:text-[16px]"
              onClick={handleCancel}
              disabled={isLoading}
            />
            <Button
              variant="primary"
              type="button"
              text={isLoading ? "Saving..." : "Save"}
              className="max-sm:h-9 max-sm:w-28 max-sm:text-[16px]"
              onClick={handleSave}
              disabled={isLoading}
            />
          </div>
        ) : (
          <Button
            variant="secondary"
            className="text-middle-orange w-28 h-9 m-auto"
            type="button"
            text="Edit"
            onClick={handleEditStart}
          />
        )}
      </div>
      {(error || success) && (
        <div
          className={`mt-4 p-3 rounded-md ${
            error
              ? "bg-red-50 border border-red-200 text-red-800"
              : "bg-green-50 border border-green-200 text-green-800"
          }`}
        >
          {error || success}
        </div>
      )}
    </section>
  );
};

export default UpdateAvatarAndName;
