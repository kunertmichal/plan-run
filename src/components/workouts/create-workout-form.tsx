import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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

type CreateWorkoutFormProps = {
  onCancel: () => void;
};

const workoutSchema = z.object({
  name: z.string().min(1),
  distance: z.number().min(0),
  duration: z.string().min(1),
  tempo: z.string().min(1),
});

type WorkoutFormData = z.infer<typeof workoutSchema>;

export function CreateWorkoutForm({ onCancel }: CreateWorkoutFormProps) {
  const form = useForm<WorkoutFormData>({
    resolver: zodResolver(workoutSchema),
  });

  const onSubmit = (data: WorkoutFormData) => {
    console.log(data);
  };

  return (
    <Form {...form}>
      <form
        id="create-workout-form"
        className="space-y-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="name"
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
        <FormField
          control={form.control}
          name="distance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dystans</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Czas trwania</FormLabel>
              <FormControl>
                <Input placeholder="h:mm:ss" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tempo</FormLabel>
              <FormControl>
                <Input placeholder="mm:ss" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>

      <div className="flex flex-col gap-2 mt-auto">
        <Button className="w-full" type="submit" form="create-workout-form">
          Zapisz
        </Button>
        <Button variant="outline" className="w-full" onClick={onCancel}>
          Anuluj
        </Button>
      </div>
    </Form>
  );
}
