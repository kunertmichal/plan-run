import { Link, useRouter } from "@tanstack/react-router";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";

export function Navigation() {
  const { signOut } = useAuthActions();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.navigate({ to: "/" });
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
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

          <div className="hidden md:flex items-center space-x-4">
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

          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-expanded="false"
            >
              <span className="sr-only">Otwórz menu główne</span>
              <svg
                className={`${isMenuOpen ? "hidden" : "block"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                className={`${isMenuOpen ? "block" : "hidden"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className={`${isMenuOpen ? "block" : "hidden"} md:hidden`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
            <Link
              to="/calendar"
              className="text-gray-700 hover:text-gray-600 block px-3 py-2 rounded-md text-base font-medium"
              activeProps={{ className: "text-blue-600 font-semibold" }}
              onClick={() => setIsMenuOpen(false)}
            >
              Kalendarz
            </Link>

            <Link
              to="/profile"
              className="text-gray-700 hover:text-gray-600 block px-3 py-2 rounded-md text-base font-medium"
              activeProps={{ className: "text-blue-600 font-semibold" }}
              onClick={() => setIsMenuOpen(false)}
            >
              Profil
            </Link>

            <button
              onClick={() => {
                setIsMenuOpen(false);
                handleSignOut();
              }}
              className="text-gray-700 hover:text-gray-600 block w-full text-left px-3 py-2 rounded-md text-base font-medium"
            >
              Wyloguj
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
