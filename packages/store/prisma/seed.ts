import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Insert regions
  await prisma.region.createMany({
    data: [
      { id: "32c9087b-7c53-4d84-8b63-32517cbd17c3", name: "india" },
      { id: "f5a13f6c-8e91-42b8-9c0e-07b4567a98e0", name: "usa" }
    ],
    skipDuplicates: true // prevents re-inserting if already exists
  });
}

main()
  .then(() => {
    console.log("✅ Seeding finished");
  })
  .catch((e) => {
    console.error("❌ Seeding error", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());