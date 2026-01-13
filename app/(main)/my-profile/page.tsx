import React from "react";
import UpdateAvatarAndName from "./_components/UpdateAvatarAndName";
import UpdatePassword from "./_components/UpdatePassword";
import { getMyProfile } from "@/app/actions/my-profile/get-my-profile";
import { UserProfile } from "@/app/actions/my-profile/types";

// Force dynamic rendering since we use cookies
export const dynamic = "force-dynamic";

const MyProfilePage = async () => {
  try {
    const result = await getMyProfile();

    if (!result.success) {
      if (result.status === 401) {
        console.warn("Profile access denied - user not authenticated");
      } else {
        console.error("Failed to load profile:", result.message);
      }
      return (
        <main className="px-8 pt-4 xl:px-16 xl:pt-8 w-full max-w-[1096px]">
          <section className="mb-4 xl:mb-8 max-sm:mb-12">
            <h2 className="text-4xl font-medium max-sm:leading-[150%] max-sm:mt-5 text-[2rem]">
              My Profile
            </h2>
          </section>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 w-auto">
            <p className="text-red-700">
              {result.message ||
                "Failed to load profile information. Please try refreshing the page."}
            </p>
            {result.status === 401 && (
              <p className="text-sm text-red-600 mt-2">
                Please log in again to continue.
              </p>
            )}
          </div>
        </main>
      );
    }

    if (!result.data) {
      return (
        <main className="px-8 pt-4 xl:px-16 xl:pt-8 w-full">
          <section className="mb-4 xl:mb-8 max-sm:mb-12">
            <h2 className="text-4xl font-medium max-sm:leading-[150%] max-sm:mt-5 text-[2rem]">
              My Profile
            </h2>
          </section>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-700">
              No profile data available. Please try refreshing the page.
            </p>
          </div>
        </main>
      );
    }

    const profile: UserProfile = result.data;

    return (
      <main className="max-sm:px-6 px-8 desktop:px-[52px] max-sm:pb-24 desktop:pt-2 pb-12 desktop:pb-16 w-full overflow-hidden">
        <section className="mb-4 xl:mb-8 max-sm:mb-12 max-sm:flex max-sm:justify-between max-sm:items-center">
          <div>
            <h2 className="text-3xl desktop:text-4xl font-medium font-geist max-sm:leading-[150%] max-sm:mt-5 text-[2rem]">
              My profile
            </h2>
            <p className="text-lg font-medium text-dark-grey-3 max-sm:text-[#6C7278] max-sm:text-sm mt-2">
              {profile.email}
            </p>
          </div>
          <div className="hidden max-sm:flex">
            <button className="border-l border-light-grey-2 flex font-geist leading-[150%] text-[1.0625rem] items-center gap-2 justify-end w-[116px] h-12 text-dark-grey">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  d="M11.0316 2.16675C11.1382 2.16675 11.2285 2.238 11.2513 2.34546L11.2572 2.39429V8.93335H7.18977C6.57219 8.9336 6.06481 9.44072 6.06477 10.0583C6.06477 10.6655 6.55377 11.182 7.18977 11.1736V11.1755H11.2484V17.6169C11.2483 17.7369 11.1508 17.8337 11.0316 17.8337C8.69701 17.8337 6.74524 17.0209 5.37825 15.6541C4.01119 14.287 3.19856 12.3346 3.19856 9.99976C3.19864 7.66511 4.01125 5.71343 5.37825 4.34644C6.74525 2.97944 8.69692 2.16683 11.0316 2.16675Z"
                  stroke="#6D6B6B"
                />
                <path
                  d="M13.514 6.88867C13.951 6.45174 14.6679 6.45174 15.1048 6.88867H15.1058L17.472 9.26367L17.5482 9.34766C17.9019 9.78169 17.8848 10.4279 17.4623 10.835L17.4642 10.8369L15.097 13.2119C14.8733 13.4356 14.5849 13.542 14.3011 13.542C14.0174 13.5419 13.7299 13.4356 13.5062 13.2119C13.0694 12.775 13.0695 12.059 13.5062 11.6221L13.9535 11.1748H11.2513V8.9248H13.9603L13.514 8.47852C13.0775 8.0417 13.0776 7.32554 13.514 6.88867Z"
                  stroke="#6D6B6B"
                />
              </svg>
              <span>Sign Out</span>
            </button>
          </div>
        </section>
        <UpdateAvatarAndName profile={profile} />
        <UpdatePassword />
      </main>
    );
  } catch (error) {
    console.error("Unexpected error loading profile:", error);
    return (
      <main className="px-8 pt-4 xl:px-16 xl:pt-8 w-full">
        <section className="mb-4 xl:mb-8 max-sm:mb-12">
          <h2 className="text-4xl font-medium max-sm:leading-[150%] max-sm:mt-5 text-[2rem]">
            My Profile
          </h2>
        </section>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-warning-red">
            An unexpected error occurred. Please try refreshing the page.
          </p>
        </div>
      </main>
    );
  }
};

export default MyProfilePage;
