import { Link, useRouter } from "@tanstack/react-router";
import { useAuthActions } from "@convex-dev/auth/react";

export function Navigation() {
  const { signOut } = useAuthActions();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.navigate({ to: "/" });
  };

  return (
    <nav className="bg-white border-b">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/calendar" className="text-xl font-semibold">
              🏃 PlanRun
            </Link>
          </div>

          <div className="flex items-center space-x-8">
            <Link
              to="/calendar"
              className="text-gray-700 hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium"
              activeProps={{ className: "text-blue-600 font-semibold" }}
            >
              Kalendarz
            </Link>

            <Link
              to="/profile"
              className="text-gray-700 hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium"
              activeProps={{ className: "text-blue-600 font-semibold" }}
            >
              Profil
            </Link>

            <button
              onClick={handleSignOut}
              className="cursor-pointer hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Wyloguj
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
