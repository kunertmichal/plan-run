import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const schema = defineSchema({
  ...authTables,
  workoutTemplates: defineTable({
    userId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    segments: v.array(
      v.object({
        type: v.union(
          v.literal("easy"),
          v.literal("tempo"),
          v.literal("interval"),
          v.literal("time_trial")
        ),
        distance: v.number(),
        tempo: v.string(),
        duration: v.string(),
        repetitions: v.optional(v.number()),
      })
    ),
  }).index("by_user", ["userId"]),

  scheduledWorkouts: defineTable({
    userId: v.id("users"),
    date: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    segments: v.array(
      v.object({
        type: v.union(
          v.literal("easy"),
          v.literal("tempo"),
          v.literal("interval"),
          v.literal("time_trial")
        ),
        distance: v.number(),
        tempo: v.string(),
        duration: v.string(),
        repetitions: v.optional(v.number()),
      })
    ),
  }).index("by_user_date", ["userId", "date"]),
});

export default schema;
