import React from "react";
import UserList from "./_components/UserList";
import { OtherUser } from "@/app/actions/api/types";
import { apiGet } from "@/app/actions/api/api-client";

export const dynamic = 'force-dynamic';

const page = async () => {
  const allUsersFetch = await apiGet<OtherUser[]>("/api/user/all-users");

  const allUsers = allUsersFetch.data;

  if (!allUsers) {
    throw new Error("Failed to load user data");
  }

  return <UserList allUsers={allUsers} />;
};

export default page;
