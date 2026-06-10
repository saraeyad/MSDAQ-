import { useAuth } from "@/context/auth";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./header";
import Sidebar from "./sidebar";

export default function MainLayout() {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const role = user?.role === "admin" || user?.role === "journalist" ? user.role : undefined;

  return (
    <div className="misdaq-showcase-surface min-h-screen" data-role={role}>
      <div className="fixed start-0 top-0 z-50 hidden h-screen w-72 md:block">
        <Sidebar />
      </div>

      {isSidebarOpen ? (
        <div
          className="fixed inset-0 z-40 flex md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        >
          <div
            className="z-50 h-full w-full max-w-xs bg-sidebar"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar onClose={() => setIsSidebarOpen(false)} />
          </div>
          <div className="flex-1 bg-black/50" />
        </div>
      ) : null}

      <div className="md:ps-72">
        <Header onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />
        <main className="container-page min-h-[calc(100vh-4rem)] pb-6 pt-16">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
