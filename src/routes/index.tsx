import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Authenticated, Unauthenticated } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { signIn } = useAuthActions();

  return (
    <div className="min-h-screen bg-gray-50">
      <Authenticated>
        <div className="text-center py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Witaj w Plan Run!
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Jesteś zalogowany. Przejdź do dashboard, aby zarządzać treningami.
          </p>
          <a
            href="/dashboard"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
          >
            Przejdź do Dashboard
          </a>
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
              onClick={() => signIn("google")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Zaloguj się
            </Button>
            <a
              href="/about"
              className="inline-block bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700"
            >
              Dowiedz się więcej
            </a>
          </div>
        </div>
      </Unauthenticated>
    </div>
  );
}
