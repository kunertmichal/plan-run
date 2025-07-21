import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getScheduledWorkouts = query({
  args: {
    dateFrom: v.string(),
    dateTo: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    if (args.dateFrom > args.dateTo) {
      throw new Error("dateFrom must be less than or equal to dateTo");
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(args.dateFrom) || !dateRegex.test(args.dateTo)) {
      throw new Error("Date format must be YYYY-MM-DD");
    }

    return await ctx.db
      .query("scheduledWorkouts")
      .withIndex("by_user_date", (q) =>
        q
          .eq("userId", userId)
          .gte("date", args.dateFrom)
          .lte("date", args.dateTo)
      )
      .collect();
  },
});

export const createScheduledWorkout = mutation({
  args: {
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
        tempo: v.number(),
        duration: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    return ctx.db.insert("scheduledWorkouts", {
      userId,
      date: args.date,
      name: args.name,
      description: args.description,
      segments: args.segments,
    });
  },
});
