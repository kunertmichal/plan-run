import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormLabel,
  FormControl,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// export type WorkoutFormData = {
//   data: string;
//   onSubmit: (data: unknown) => void;
// };

export function CreateWorkoutForm() {
  const form = useForm();

  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name="username"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nazwa treningu</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="flex flex-col gap-2 mt-auto">
        <Button className="w-full" type="submit">
          Zapisz
        </Button>
        <Button variant="outline" className="w-full">
          Anuluj
        </Button>
      </div>
    </Form>
  );
}
