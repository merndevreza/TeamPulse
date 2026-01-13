"use server";
import { revalidateTag } from "next/cache";

export const revalidateAllDots = async () => {
  revalidateTag("dots:all", "max");
}

export const revalidateUserGivenDots = async () => {
  revalidateTag("user:dots_given", "max");
};

export const revalidateUserReceivedDots = async () => {
  revalidateTag("user:dots_received", "max");
}

export const revalidateUserDotsSummary = async () => {
    revalidateTag("user:dots_summary", "max");
}

export const revalidateAllUsers = async () => {
  revalidateTag("users:all", "max");
}

export const revalidateAdminRouteAllUsers = async () => {
  revalidateTag("admin-users:all", "max");
}