import { Button } from "@/components/ui/button";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../convex/_generated/api";

export function App() {
  const { signIn, signOut } = useAuthActions();
  const user = useQuery(api.users.currentSession);

  console.log(user);

  return (
    <div className="text-3xl text-red-500">
      <Authenticated>
        <Button onClick={() => signOut()}>logout</Button>
      </Authenticated>
      <Unauthenticated>
        <Button
          onClick={() =>
            signIn("google", {
              redirectTo: "/test",
            })
          }
        >
          login
        </Button>
      </Unauthenticated>
    </div>
  );
}
