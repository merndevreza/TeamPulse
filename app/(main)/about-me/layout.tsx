import React from "react";
import AboutNav from "@/components/About/AboutNav";
import { User } from "@/app/actions/api/types";
import Title from "@/components/Title";
import { apiGet } from "@/app/actions/api/api-client";

interface LayoutProps {
  children: React.ReactNode;
}

export default async function Layout({ children }: LayoutProps) {
  const userFetch = await apiGet<User>("/api/user/profile");

  const user = userFetch.data;

  if (!user) {
    throw new Error("Failed to load user data");
  }

  return (
    <section className="desktop:pl-15 pl-[22px] pr-8 pt-0 desktop:pr-31 w-full max-sm:px-4 max-sm:pt-3.5 max-sm:pb-8">
      <div className="flex max-sm:flex-col max-sm:items-start w-full gap-[7vw] desktop:gap-[2.9vw] max-[1000px]:gap-[2vw]  items-center -mt-px desktop:mt-0">
        <div className="flex items-center gap-4">
          <svg className="w-4 desktop:w-5" xmlns="http://www.w3.org/2000/svg" width="20" height="23" viewBox="0 0 20 23" fill="none">
            <path d="M9.99121 0C6.99573 0 4.56741 2.42832 4.56741 5.4238C4.56741 8.41928 6.99573 10.8476 9.99121 10.8476C12.9867 10.8476 15.415 8.41928 15.415 5.4238C15.415 2.42832 12.9867 0 9.99121 0Z" fill="#8A8483" />
            <path d="M9.99121 13.7022C7.3932 13.7022 5.00298 14.0957 3.23122 14.7601C2.3485 15.0911 1.57466 15.5059 1.00611 16.01C0.438567 16.5132 0 17.1783 0 17.9842C0 18.79 0.438567 19.4552 1.00611 19.9584C1.57466 20.4624 2.3485 20.8773 3.23122 21.2083C5.00298 21.8727 7.3932 22.2661 9.99121 22.2661C12.5892 22.2661 14.9794 21.8727 16.7512 21.2083C17.6339 20.8773 18.4078 20.4624 18.9763 19.9584C19.5439 19.4552 19.9824 18.79 19.9824 17.9842C19.9824 17.1783 19.5439 16.5132 18.9763 16.01C18.4078 15.5059 17.6339 15.0911 16.7512 14.7601C14.9794 14.0957 12.5892 13.7022 9.99121 13.7022Z" fill="#8A8483" />
          </svg>
          <Title first_name={user.first_name} last_name={user.last_name} />
        </div>
        <AboutNav link="/about-me/" />
      </div>
      {children}
    </section>
  );
}
