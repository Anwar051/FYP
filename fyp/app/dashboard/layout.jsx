// app/dashboard/layout.jsx
import Sidebar from "./_components/Sidebar";
import DashboardHeader from "./_components/DashboardHeader";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen flex">
      <Sidebar />

      <div className="flex-1 bg-[#F7F8FA]">
       
        <div className="p-3 flex justify-end border-b  bg-white shadow-sm">
          <DashboardHeader />
        </div>

        <div className="p-10">{children}</div>
      </div>
    </div>
  );
}
