import { UserForAdmin } from "@/app/actions/api/types";
import { cookies } from "next/headers";
import Title from "@/components/Title";
import { apiGet } from "@/app/actions/api/api-client";
import ManageMemberSVG from "@/lib/SVGS/ManageMemberSVG";
import PeopleContainersWrapper from "./_components/PeopleContainersWrapper";

export const dynamic = 'force-dynamic';

const page = async () => {
  const adminRouteUsersFetched = await apiGet<UserForAdmin[]>("/api/user/admin/users");

  const adminRouteUsers = adminRouteUsersFetched.data;

  if (!adminRouteUsers) {
    throw new Error("Failed to load user data");
  }

  const activeUsers = adminRouteUsers.filter((user) => user.is_active);
  const inactiveUsers = adminRouteUsers.filter((user) => !user.is_active);

  const token = (await cookies()).get("accessToken")?.value;

  return (
    <section className="pt-0 pl-14.5 pr-11 w-full max-sm:pt-4 max-sm:px-3">
      <div className="w-full border-b border-light-grey-2 pb-[15px]">
        <div className="pl-1.5 flex gap-[15px] items-center">
          <div className="pt-1">
            <ManageMemberSVG />
          </div>
          <Title first_name="Manage" last_name="members" />
        </div>
      </div>
      <PeopleContainersWrapper
        allUsers={adminRouteUsers}
        activeUsers={activeUsers}
        inactiveUsers={inactiveUsers}
        token={token}
      />
    </section>
  );
};

export default page;
