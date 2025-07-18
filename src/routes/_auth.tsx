import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Authenticated } from "convex/react";
import { Navigation } from "@/components/Navigation";

export const Route = createFileRoute("/_auth")({
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <Authenticated>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <Outlet />
          </div>
        </main>
      </div>
    </Authenticated>
  );
}
