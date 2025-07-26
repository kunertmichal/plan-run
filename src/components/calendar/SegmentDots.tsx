import { cn } from "@/lib/utils";
import { getSegmentColor } from "@/utils/calendar";

interface SegmentDotsProps {
  segments: Array<{ type: string }>;
}

export const SegmentDots = ({ segments }: SegmentDotsProps) => {
  if (!segments || segments.length === 0) return null;

  return (
    <div className="flex gap-1">
      {segments.map((segment, index) => (
        <div
          key={index}
          className={cn("w-2 h-2 rounded-full", getSegmentColor(segment.type))}
          title={segment.type}
        />
      ))}
    </div>
  );
};
