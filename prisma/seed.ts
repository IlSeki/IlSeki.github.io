import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.raceEntry.deleteMany({});
  await prisma.race.deleteMany({});

  console.log("Seeding database...");

  const race1 = await prisma.race.create({
    data: {
      seed: "rizzler123",
      duration: 35.42,
      chaosMode: false,
      entries: {
        create: [
          {
            marbleName: "Skibidi Toilet",
            finishTime: 35.42,
            position: 1,
            powerupsCollected: 3,
            debuffsHit: 1,
            isBot: true,
          },
          {
            marbleName: "Baby Gronk",
            finishTime: 38.15,
            position: 2,
            powerupsCollected: 1,
            debuffsHit: 2,
            isBot: false,
          },
          {
            marbleName: "Kai Cenat",
            finishTime: 42.90,
            position: 3,
            powerupsCollected: 2,
            debuffsHit: 4,
            isBot: true,
          },
        ],
      },
    },
  });

  const race2 = await prisma.race.create({
    data: {
      seed: "fanum_tax_mode",
      duration: 41.12,
      chaosMode: true,
      entries: {
        create: [
          {
            marbleName: "W Rizzler",
            finishTime: 41.12,
            position: 1,
            powerupsCollected: 6,
            debuffsHit: 2,
            isBot: false,
          },
          {
            marbleName: "Livvy Dunne",
            finishTime: 45.30,
            position: 2,
            powerupsCollected: 4,
            debuffsHit: 3,
            isBot: true,
          },
        ],
      },
    },
  });

  console.log(`Database seeded successfully! Created races: ${race1.id}, ${race2.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
