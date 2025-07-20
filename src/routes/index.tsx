import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Authenticated, Unauthenticated } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { signIn } = useAuthActions();

  const handleSignIn = () => {
    signIn("google", { redirectTo: "/calendar" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Authenticated>
        <div className="text-center py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Witaj w Plan Run!
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Jesteś zalogowany. Przejdź do kalendarza, aby zarządzać treningami.
          </p>
          <Link
            to="/calendar"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
          >
            Przejdź do Kalendarza
          </Link>
        </div>
      </Authenticated>

      <Unauthenticated>
        <div className="text-center py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Plan Run</h1>
          <p className="text-xl text-gray-600 mb-8">
            Zarządzaj swoimi treningami i planuj rozwój
          </p>
          <div className="space-x-4">
            <Button
              onClick={handleSignIn}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Zaloguj się
            </Button>
          </div>
        </div>
      </Unauthenticated>
    </div>
  );
}
