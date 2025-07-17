import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getTemplates = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("workoutTemplates")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const createTemplate = mutation({
  args: {
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
        tempo: v.number(),
        duration: v.number(),
      })
    ),
  },
  handler(ctx, args) {
    return ctx.db.insert("workoutTemplates", {
      userId: args.userId,
      name: args.name,
      description: args.description,
      segments: args.segments,
    });
  },
});
