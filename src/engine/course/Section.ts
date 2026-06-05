import { CourseSection } from "@/types/game";

export type SectionTheme = "normal" | "fast" | "tight" | "chaos";

export interface CourseSectionConfig {
  theme: SectionTheme;
  yStart: number;
  yEnd: number;
}
