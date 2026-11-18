import { Outlet } from "react-router-dom";

import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export function AppLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex flex-1 flex-col">
        <TopBar />

        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
