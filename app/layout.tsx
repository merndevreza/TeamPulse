import type { Metadata } from "next";
import "./globals.css";
import { geist } from "./fonts/fonts";
import ReactToastifyContainer from "@/components/ReactToastifyContainer";
import DotsProvider from "./contexts/DotsContext";
import { AllUsersProvider } from "./contexts/AllUsersContext";
import { ActionStateProvider } from "./contexts/ActionStateContext";
import { cookies } from "next/headers";
import { AuthProvider } from "./contexts/AuthContext";
import { getUserInfoFromToken } from "@/utils/token-cache";
import { TokenRefreshHandler } from "@/components/TokenRefreshHandler";

export const metadata: Metadata = {
  title: "Internal Lexaeon Dots Tool",
  icons: {
    icon: "/dot-tool-fav.ico"
  },
  description:
    "This is an internal tool for managing dots given to the employees in Lexaeon.",
  // Search engine  visibility is disabled initially
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      "max-image-preview": "none",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const userInfo = await getUserInfoFromToken(accessToken);

  return (
    <html lang="en">
      <body className={`${geist.variable} font-geist antialiased text-dark-black`}>
        <AuthProvider userInfo={userInfo}>
          <TokenRefreshHandler />
          <ActionStateProvider>
            <AllUsersProvider>
              <DotsProvider>{children}</DotsProvider>
            </AllUsersProvider>
          </ActionStateProvider>
        </AuthProvider>
        <ReactToastifyContainer />
      </body>
    </html>
  );
}
