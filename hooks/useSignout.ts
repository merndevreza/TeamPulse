import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "./useAuth";
import { handleLogout } from "@/app/actions/auth/logout";
import { toast } from "react-toastify";

const useSignout = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { clearUser } = useAuth();

  const handleLogoutClick = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const response = await handleLogout();

      if (response.success) {
        clearUser();
        router.replace("/");
      } else {
        toast.error(response.message || "Logout failed");
      }
    } catch (error: unknown) {
      console.error("Logout error:", error);
      const errorMessage =
        error && typeof error === "object" && "message" in error
          ? (error as { message?: string }).message
          : "An unexpected error occurred during logout";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  return { isLoading, handleLogoutClick };
};

export default useSignout;
