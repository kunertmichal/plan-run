import { Link, useRouter } from "@tanstack/react-router";
import { useAuthActions } from "@convex-dev/auth/react";

export function Navigation() {
  const { signOut } = useAuthActions();
  const router = useRouter();

  const handleSignOut = () => {
    signOut();
    router.navigate({ to: "/" });
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-semibold">
              Plan Run
            </Link>
          </div>

          <div className="flex items-center space-x-8">
            <Link
              to="/dashboard"
              className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              activeProps={{ className: "text-blue-600 font-semibold" }}
            >
              Dashboard
            </Link>

            <Link
              to="/profile"
              className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              activeProps={{ className: "text-blue-600 font-semibold" }}
            >
              Profil
            </Link>

            <button
              onClick={handleSignOut}
              className="text-red-600 hover:text-red-800 px-3 py-2 rounded-md text-sm font-medium"
            >
              Wyloguj
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
