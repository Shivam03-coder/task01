import { PrismaClient } from "@prisma/client";
import { companies } from "../src/data/index";

const prisma = new PrismaClient();

async function main() {
  await prisma.company.createMany({
    data: companies.map((company) => ({
      name: company.companyName,
      website: company.website,
      email: company.email,
    })),
    skipDuplicates: true,
  });
  console.log("Seeded companies.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });