import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { usePathname } from "next/navigation";
import { getMyProfile } from "@/app/actions/my-profile/get-my-profile";

const useHeader = () => {
  const [userInfo, setUserInfo] = useState<{
    firstName: string;
    lastName: string;
  } | null>(null);
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  const fetchUserInfo = async () => {
    try {
      const result = await getMyProfile();
      if (result.success && result.data) {
        setUserInfo({
          firstName: result.data.first_name,
          lastName: result.data.last_name,
        });
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    }
  };
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserInfo();
    }
  }, [isAuthenticated]);

  return { userInfo, pathname };
};

export default useHeader;
