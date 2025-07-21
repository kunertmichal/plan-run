import { z } from "zod";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
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
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Doc } from "../../../convex/_generated/dataModel";

type CreateWorkoutFormProps = {
  date: Date;
  event?: Doc<"scheduledWorkouts">;
  onCancel: () => void;
};

const workoutSchema = z.object({
  date: z.date(),
  name: z.string().min(1),
  distance: z.string().min(1),
  duration: z.string().min(1),
  tempo: z.string().min(1),
});

type WorkoutFormData = z.infer<typeof workoutSchema>;

export function CreateWorkoutForm({
  date,
  event,
  onCancel,
}: CreateWorkoutFormProps) {
  const createWorkout = useMutation(
    api.scheduledWorkouts.createScheduledWorkout
  );

  const form = useForm<WorkoutFormData>({
    resolver: zodResolver(workoutSchema),
    defaultValues: {
      date,
      name: event?.name || "",
      distance: event?.segments?.[0]?.distance?.toString() || "",
      duration: event?.segments?.[0]?.duration?.toString() || "",
      tempo: event?.segments?.[0]?.tempo?.toString() || "",
    },
  });

  const onSubmit = (data: WorkoutFormData) => {
    createWorkout({
      name: data.name,
      date: format(data.date, "yyyy-MM-dd"),
      segments: [],
    });
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
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled
                  value={format(field.value, "dd.MM.yyyy")}
                />
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
                <Input {...field} type="number" placeholder="km" />
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
                <Input placeholder="hh:mm:ss" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tempo"
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
