import Header from "@/components/Header/Header";
import MobileHeader from "@/components/Header/MobileHeader";
import MobileNavbar from "@/components/MobileNavbar/MobileNavbar";
import Sidebar from "@/components/Sidebar/Sidebar";


export default function MainDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-1 text-[16px] font-medium max-sm:w-full"> 
      <Sidebar />
      <div className="relative flex-1 overflow-y-auto max-sm:w-full">
        <Header />
        <MobileHeader />
        {children}
        <MobileNavbar />
      </div>
    </div>
  );
}
