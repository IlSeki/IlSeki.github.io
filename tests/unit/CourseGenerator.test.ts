import { describe, test, expect } from "vitest";
import { generateCourse } from "../../src/engine/course/CourseGenerator";
import { SECTION_COUNT } from "../../src/config/constants";

describe("CourseGenerator Unit Tests", () => {
  test("generates exactly the expected number of sections", () => {
    const sections = generateCourse("test-seed-123");
    expect(sections).toHaveLength(SECTION_COUNT);
  });

  test("defines correct Y boundaries per section index", () => {
    const sections = generateCourse("test-seed-123");
    sections.forEach((sec, idx) => {
      expect(sec.yStart).toBe(idx * 400);
      expect(sec.yEnd).toBe((idx + 1) * 400);
    });
  });

  test("guarantees every obstacle type appears at least once in the course", () => {
    const sections = generateCourse("test-seed-123");
    const obstacleTypes = new Set<string>();
    
    sections.forEach((sec) => {
      sec.obstacles.forEach((obs) => {
        obstacleTypes.add(obs.type);
      });
    });

    const expectedTypes = [
      "peg", "rotatingPaddle", "bumper", "funnel",
      "trapdoor", "flipper", "narrowMaze", "fan",
      "magnet", "warpPortal", "trampoline", "tornado",
      "laserBlock", "spiralSlide", "iceZone", "mudZone"
    ];

    expectedTypes.forEach((t) => {
      expect(obstacleTypes.has(t)).toBe(true);
    });
  });

  test("guarantees collectibles are at least 40px away from obstacles", () => {
    const sections = generateCourse("test-seed-123");
    sections.forEach((sec) => {
      sec.collectibles.forEach((col) => {
        sec.obstacles.forEach((obs) => {
          const dx = obs.x - col.x;
          const dy = obs.y - col.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          expect(dist).toBeGreaterThanOrEqual(40);
        });
      });
    });
  });
});
