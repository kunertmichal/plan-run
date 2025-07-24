import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Doc } from "../../../convex/_generated/dataModel";
import { PlusIcon, TrashIcon } from "lucide-react";
import { Duration } from "luxon";

type CreateWorkoutFormProps = {
  date: Date;
  event?: Doc<"scheduledWorkouts">;
  onCancel: () => void;
};

const segmentSchema = z.object({
  type: z.enum(["easy", "tempo", "interval", "time_trial"]),
  distance: z.string().min(1, "Dystans jest wymagany"),
  tempo: z.string().min(1, "Tempo jest wymagane"),
  duration: z.string().min(1, "Czas trwania jest wymagany"),
});

const workoutSchema = z.object({
  date: z.date(),
  name: z.string().min(1, "Nazwa treningu jest wymagana"),
  description: z.string().optional(),
  segments: z
    .array(segmentSchema)
    .min(1, "Przynajmniej jeden segment jest wymagany"),
});

type WorkoutFormData = z.infer<typeof workoutSchema>;

const segmentTypeLabels = {
  easy: "Easy",
  tempo: "Tempo",
  interval: "Interwał",
  time_trial: "Próba czasowa",
};

export function CreateWorkoutForm({
  date,
  event,
  onCancel,
}: CreateWorkoutFormProps) {
  const createWorkout = useMutation(
    api.scheduledWorkouts.createScheduledWorkout
  );
  const updateWorkout = useMutation(
    api.scheduledWorkouts.updateScheduledWorkout
  );
  const deleteWorkout = useMutation(
    api.scheduledWorkouts.deleteScheduledWorkout
  );

  const form = useForm<WorkoutFormData>({
    resolver: zodResolver(workoutSchema),
    defaultValues: {
      date,
      name: event?.name || "",
      description: event?.description || "",
      segments: event?.segments?.length
        ? event.segments.map((segment) => ({
            type: segment.type,
            distance: segment.distance.toString(),
            tempo: segment.tempo.toString(),
            duration: segment.duration.toString(),
          }))
        : [
            {
              type: "easy",
              distance: "",
              tempo: "",
              duration: "",
            },
          ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "segments",
  });

  const handleParamEdit = (
    segmentIndex: number,
    param: "distance" | "tempo" | "duration"
  ) => {
    const distance = form.getValues(`segments.${segmentIndex}.distance`);
    const tempo = form.getValues(`segments.${segmentIndex}.tempo`);
    const duration = form.getValues(`segments.${segmentIndex}.duration`);
    const params = [
      { name: "distance", value: distance },
      { name: "tempo", value: tempo },
      { name: "duration", value: duration },
    ];
    const tempoInSeconds = calculateTimeToSeconds(tempo);
    const durationInSeconds = calculateTimeToSeconds(duration);

    const emptyParams = params.filter((param) => param.value === "");

    if (emptyParams.length === 0) {
      switch (param) {
        case "distance": {
          // update duration
          const durationSeconds = tempoInSeconds * parseFloat(distance);
          const newDuration = calculateSecondsToDuration(durationSeconds);
          const currentDuration = form.getValues(
            `segments.${segmentIndex}.duration`
          );
          if (newDuration !== currentDuration) {
            form.setValue(`segments.${segmentIndex}.duration`, newDuration);
          }
          break;
        }
        case "tempo": {
          // update duration
          const durationSeconds = tempoInSeconds * parseFloat(distance);
          const newDuration = calculateSecondsToDuration(durationSeconds);
          const currentDuration = form.getValues(
            `segments.${segmentIndex}.duration`
          );
          if (newDuration !== currentDuration) {
            form.setValue(`segments.${segmentIndex}.duration`, newDuration);
          }
          break;
        }
        case "duration": {
          // update tempo
          const distanceNum = parseFloat(distance);
          if (distanceNum > 0) {
            const tempoSeconds = durationInSeconds / distanceNum;
            const newTempo = calculateSecondsToTempo(tempoSeconds);
            const currentTempo = form.getValues(
              `segments.${segmentIndex}.tempo`
            );
            if (newTempo !== currentTempo) {
              form.setValue(`segments.${segmentIndex}.tempo`, newTempo);
            }
          }
          break;
        }
        default:
          throw new Error("Invalid parameter");
      }
    } else if (emptyParams.length === 1) {
      const missingParam = params.find((param) => param.value === "")!;
      
      switch (missingParam.name) {
        case "distance": {
          // Calculate distance from tempo and duration
          if (tempo && duration && tempoInSeconds > 0) {
            const distanceNum = durationInSeconds / tempoInSeconds;
            const newDistance = distanceNum.toFixed(1);
            form.setValue(`segments.${segmentIndex}.distance`, newDistance);
          }
          break;
        }
        case "tempo": {
          // Calculate tempo from distance and duration
          if (distance && duration) {
            const distanceNum = parseFloat(distance);
            if (distanceNum > 0) {
              const tempoSeconds = durationInSeconds / distanceNum;
              const newTempo = calculateSecondsToTempo(tempoSeconds);
              form.setValue(`segments.${segmentIndex}.tempo`, newTempo);
            }
          }
          break;
        }
        case "duration": {
          // Calculate duration from distance and tempo
          if (distance && tempo && tempoInSeconds > 0) {
            const distanceNum = parseFloat(distance);
            const durationSeconds = tempoInSeconds * distanceNum;
            const newDuration = calculateSecondsToDuration(durationSeconds);
            form.setValue(`segments.${segmentIndex}.duration`, newDuration);
          }
          break;
        }
      }
    }
  };

  const calculateTimeToSeconds = (time: string) => {
    if (time === "") return 0;
    const partsCount = time.split(":").length;
    const normalizedTime = partsCount === 2 ? `00:${time}` : time;
    const duration = Duration.fromISOTime(normalizedTime);
    return duration.as("seconds");
  };

  const calculateSecondsToDuration = (seconds: number) => {
    const duration = Duration.fromObject({ seconds });
    const result = duration.toFormat("hh:mm:ss");
    return result;
  };

  const calculateSecondsToTempo = (seconds: number) => {
    const duration = Duration.fromObject({ seconds });
    const result = duration.toFormat("mm:ss");
    return result;
  };

  const onSubmit = (data: WorkoutFormData) => {
    const workoutData = {
      name: data.name,
      date: format(data.date, "yyyy-MM-dd"),
      description: data.description,
      segments: data.segments.map((segment) => ({
        type: segment.type,
        distance: parseFloat(segment.distance),
        tempo: segment.tempo,
        duration: segment.duration,
      })),
    };

    if (event) {
      // Update existing workout
      updateWorkout({
        id: event._id,
        ...workoutData,
      });
    } else {
      // Create new workout
      createWorkout(workoutData);
    }
    onCancel();
  };

  const addSegment = () => {
    append({
      type: "easy",
      distance: "",
      tempo: "",
      duration: "",
    });
  };

  const removeSegment = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const handleDelete = () => {
    if (event) {
      deleteWorkout({ id: event._id });
      onCancel();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Form {...form}>
        <form
          id="create-workout-form"
          className="flex-1 overflow-y-auto space-y-6 px-4 pb-4"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="space-y-4">
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
                    <Input {...field} placeholder="np. Easy 8km" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Opis (opcjonalny)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Segmenty</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSegment}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Dodaj segment
              </Button>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Segment {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSegment(index)}
                    disabled={fields.length === 1}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`segments.${index}.type`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Typ segmentu</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Wybierz typ" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(segmentTypeLabels).map(
                              ([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`segments.${index}.distance`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dystans (km)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min="0"
                            step="0.1"
                            placeholder="np. 5.0"
                            onChange={(e) => {
                              field.onChange(e);
                              handleParamEdit(index, "distance");
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`segments.${index}.tempo`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tempo (min/km)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="time"
                            min="00:00"
                            max="59:59"
                            onChange={(e) => {
                              field.onChange(e);
                              handleParamEdit(index, "tempo");
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`segments.${index}.duration`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Czas trwania</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="time"
                            step="1"
                            placeholder="00:00:00"
                            min="00:00:00"
                            max="23:59:59"
                            onChange={(e) => {
                              field.onChange(e);
                              handleParamEdit(index, "duration");
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        </form>
      </Form>

      <div className="flex flex-col gap-2 pt-4 border-t px-4 pb-4 bg-white">
        <Button className="w-full" type="submit" form="create-workout-form">
          {event ? "Zaktualizuj" : "Zapisz"}
        </Button>
        {event && (
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleDelete}
          >
            Usuń trening
          </Button>
        )}
      </div>
    </div>
  );
}
