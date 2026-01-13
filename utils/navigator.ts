import { cookies } from "next/headers";
import { extractRoleFromToken } from "./token-cache";
type NavigationItem = {
  url: string;
  title: string;
  mobileTitle?: string;
  img: string;
  imgWidth: number;
  imgHeight: number;
};

const navigator = async () => {
  // Use secure JWT-based role validation instead of cookie-based role
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const userRole = await extractRoleFromToken(accessToken);

  const teamMemberNavigation: NavigationItem[] = [
    {
      url: "/dashboard", 
      title: "Dashboard",
      mobileTitle: "Dashboard",
      img: "/dashboard.svg",
      imgWidth: 18,
      imgHeight: 18,
    },
    {
      url: "/about-me",
      title: "About me",
      mobileTitle: "Me",
      img: "/user-1.svg",
      imgWidth: 24,
      imgHeight: 24,
    },
    {
      url: "/about-others",
      title: "About others",
      mobileTitle: "Others",
      img: "/user-2.svg",
      imgWidth: 24,
      imgHeight: 24,
    },
  ];

  const adminNavigation: NavigationItem[] = [
    ...teamMemberNavigation,
    {
      url: "/manage-members",
      title: "Manage members",
      mobileTitle: "Members",
      img: "/manage-members-icon.svg",
      imgWidth: 36,
      imgHeight: 30,
    },
    {
      url: "/manage-dots",
      title: "Manage dots",
      mobileTitle: "Dots",
      img: "/manage-dots-icon.svg",
      imgWidth: 36,
      imgHeight: 30,
    },
  ];

  const teamMemberNavigationMobile: NavigationItem[] = [
    {
      url: "/about-me",
      title: "About me",
      mobileTitle: "Me",
      img: "/user-1.svg",
      imgWidth: 21,
      imgHeight: 21,
    },
    {
      url: "/about-others",
      title: "About others",
      mobileTitle: "Others",
      img: "/user-2.svg",
      imgWidth: 21,
      imgHeight: 21,
    },
  ];

  const adminNavigationMobile: NavigationItem[] = [
    ...teamMemberNavigationMobile,
    {
      url: "/manage-dots",
      title: "Manage dots",
      mobileTitle: "Dots",
      img: "/manage-dots-icon.svg",
      imgWidth: 22,
      imgHeight: 25,
    },
    {
      url: "/manage-members",
      title: "Manage members",
      mobileTitle: "Members",
      img: "/manage-members-icon.svg",
      imgWidth: 22,
      imgHeight: 19,
    },
  ];

  const isAdmin = userRole === "admin";

  const navigationItems =
    userRole === "admin" ? adminNavigation : teamMemberNavigation;
  const navigationItemsMobile =
    userRole === "admin" ? adminNavigationMobile : teamMemberNavigationMobile;
  return { isAdmin, navigationItems, navigationItemsMobile };
};

export default navigator;
