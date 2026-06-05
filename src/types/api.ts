import { z } from "zod";

export const LeaderboardPostSchema = z.object({
  seed: z.string(),
  duration: z.number().nonnegative(),
  chaosMode: z.boolean(),
  entries: z.array(
    z.object({
      marbleName: z.string().min(1),
      imageUrl: z.string().url().optional().nullable(),
      finishTime: z.number().nonnegative().optional().nullable(),
      position: z.number().int().positive().optional().nullable(),
      powerupsCollected: z.number().int().nonnegative().default(0),
      debuffsHit: z.number().int().nonnegative().default(0),
      isBot: z.boolean().default(false),
    })
  ).min(1),
});

export type LeaderboardPostInput = z.infer<typeof LeaderboardPostSchema>;

export interface LeaderboardResponse {
  success: boolean;
  data?: any;
  error?: string;
}
