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
import {
  TrashIcon,
  GripVerticalIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "lucide-react";
import { Duration } from "luxon";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";

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
  repetitions: z.number().min(1, "Liczba powtórzeń musi być większa od 0"),
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

// SortableSegment component for drag and drop
type SortableSegmentProps = {
  field: {
    id: string;
    type: "easy" | "tempo" | "interval" | "time_trial";
    distance: string;
    tempo: string;
    duration: string;
    repetitions: number;
  };
  index: number;
  form: ReturnType<typeof useForm<WorkoutFormData>>;
  handleParamEdit: (
    index: number,
    param: "distance" | "tempo" | "duration"
  ) => void;
  calculateTotalSegmentValues: (index: number) => {
    totalDistance: string;
    totalDuration: string;
  } | null;
  removeSegment: (index: number) => void;
  addSegmentBefore: (index: number) => void;
  addSegmentAfter: (index: number) => void;
  fieldsLength: number;
};

function SortableSegment({
  field,
  index,
  form,
  handleParamEdit,
  calculateTotalSegmentValues,
  removeSegment,
  addSegmentBefore,
  addSegmentAfter,
  fieldsLength,
}: SortableSegmentProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: field.id });

  const style = {
    transform: transform ? `translate3d(0px, ${transform.y}px, 0)` : undefined,
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border rounded-lg p-4 space-y-4 bg-white"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" {...attributes} {...listeners}>
            <GripVerticalIcon className="h-4 w-4" />
          </Button>
          <h4 className="font-medium">Segment {index + 1}</h4>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => addSegmentBefore(index)}
            title="Dodaj segment przed"
          >
            <ChevronUpIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => addSegmentAfter(index)}
            title="Dodaj segment po"
          >
            <ChevronDownIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={() => removeSegment(index)}
            disabled={fieldsLength === 1}
            title="Usuń segment"
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name={`segments.${index}.type`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Typ segmentu</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Wybierz typ" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(segmentTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`segments.${index}.repetitions`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Powtórzenia</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  min="1"
                  placeholder="1"
                  onChange={(e) =>
                    field.onChange(parseInt(e.target.value) || 1)
                  }
                />
              </FormControl>
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
                  step="0.01"
                  placeholder="np. 5.00"
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

      {(() => {
        // Watch all relevant fields to trigger re-render when they change
        const watchedFields = form.watch([
          `segments.${index}.repetitions`,
          `segments.${index}.distance`,
          `segments.${index}.duration`,
          `segments.${index}.tempo`,
        ]);
        const repetitions = watchedFields[0] || 1;

        const totals = calculateTotalSegmentValues(index);

        if (totals && repetitions > 1) {
          return (
            <div className="mt-3 p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600">
                <strong>Łącznie:</strong> {totals.totalDistance} km,{" "}
                {totals.totalDuration}
              </p>
            </div>
          );
        }

        return null;
      })()}
    </div>
  );
}

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
            repetitions: segment.repetitions || 1,
          }))
        : [
            {
              type: "easy",
              distance: "",
              tempo: "",
              duration: "",
              repetitions: 1,
            },
          ],
    },
  });

  const { fields, remove, move } = useFieldArray({
    control: form.control,
    name: "segments",
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
            const newDistance = distanceNum.toFixed(2);
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

  const calculateTotalSegmentValues = (segmentIndex: number) => {
    const distance = form.getValues(`segments.${segmentIndex}.distance`);
    const duration = form.getValues(`segments.${segmentIndex}.duration`);
    const repetitions =
      form.getValues(`segments.${segmentIndex}.repetitions`) || 1;

    if (!distance || !duration) {
      return null;
    }

    const distanceNum = parseFloat(distance);
    const durationInSeconds = calculateTimeToSeconds(duration);

    if (isNaN(distanceNum) || durationInSeconds === 0) {
      return null;
    }

    const totalDistance = distanceNum * repetitions;
    const totalDurationInSeconds = durationInSeconds * repetitions;
    const totalDuration = calculateSecondsToDuration(totalDurationInSeconds);

    return {
      totalDistance: totalDistance.toFixed(2),
      totalDuration: totalDuration,
    };
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
        repetitions: segment.repetitions || 1,
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

  const addSegmentBefore = (index: number) => {
    const newSegment = {
      type: "easy" as const,
      distance: "",
      tempo: "",
      duration: "",
      repetitions: 1,
    };

    const currentSegments = form.getValues("segments");
    const newSegments = [
      ...currentSegments.slice(0, index),
      newSegment,
      ...currentSegments.slice(index),
    ];

    form.setValue("segments", newSegments);
  };

  const addSegmentAfter = (index: number) => {
    const newSegment = {
      type: "easy" as const,
      distance: "",
      tempo: "",
      duration: "",
      repetitions: 1,
    };

    const currentSegments = form.getValues("segments");
    const newSegments = [
      ...currentSegments.slice(0, index + 1),
      newSegment,
      ...currentSegments.slice(index + 1),
    ];

    form.setValue("segments", newSegments);
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
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={({ active, over }) => {
                if (active.id !== over?.id) {
                  const oldIndex = fields.findIndex(
                    (field) => field.id === active.id
                  );
                  const newIndex = fields.findIndex(
                    (field) => field.id === over?.id
                  );
                  if (oldIndex !== -1 && newIndex !== -1) {
                    move(oldIndex, newIndex);
                  }
                }
              }}
            >
              <SortableContext
                items={fields.map((field) => field.id)}
                strategy={verticalListSortingStrategy}
              >
                {fields.map((field, index) => (
                  <SortableSegment
                    key={field.id}
                    field={field}
                    index={index}
                    form={form}
                    handleParamEdit={handleParamEdit}
                    calculateTotalSegmentValues={calculateTotalSegmentValues}
                    removeSegment={removeSegment}
                    addSegmentBefore={addSegmentBefore}
                    addSegmentAfter={addSegmentAfter}
                    fieldsLength={fields.length}
                  />
                ))}
              </SortableContext>
            </DndContext>
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
