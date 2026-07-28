import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Seeding data...");

  // 1. Branches
  const branchData = [
    { name: "Kochi (Edappally)", location: "Edappally", slug: "kochi-edappally" },
    { name: "Kochi (Kalamassery)", location: "Kalamassery", slug: "kochi-kalamassery" },
    { name: "Trivandrum", location: "Trivandrum", slug: "trivandrum" },
    { name: "Calicut", location: "Calicut", slug: "calicut" },
    { name: "Thrissur", location: "Thrissur", slug: "thrissur" },
  ];

  for (const b of branchData) {
    await prisma.branch.upsert({ where: { slug: b.slug }, update: {}, create: b });
  }
  console.log("✓ Branches seeded");

  // 2. Full Toyota India Catalogue
  const catalogue = [
    {
      name: "Fortuner",
      colours: ["Super White", "Attitude Black", "Graphite Grey", "Phantom Brown", "Pearl White", "Bronze Mica", "Sparkling Black Crystal Shine"],
    },
    {
      name: "Innova Crysta",
      colours: ["Super White", "Silver", "Attitude Black", "Graphite Grey", "Champagne", "Grey Metallic", "White Pearl", "Mica Brown"],
    },
    {
      name: "Innova HyCross",
      colours: ["Platinum White Pearl", "Midnight Black", "Sparkling Black Crystal Shine", "Mystic Bronze", "Golden Bronze", "Avant Garde Bronze", "Carnival Amber", "Tyrol Silver Gray", "Cyan Kyanite"],
    },
    {
      name: "Camry",
      colours: ["Attitude Black", "Silver", "Graphite Grey", "Platinum White Pearl", "Ruby Flare Red", "Precious Metal"],
    },
    {
      name: "Hilux",
      colours: ["Super White", "Attitude Black", "Graphite Grey", "Silver", "Orange Metallic"],
    },
    {
      name: "Glanza",
      colours: ["Sportin Red", "Gaming Grey", "Sterling Silver", "Sizzling Yellow", "Cafe White", "Nippon Blue", "Entertainer Orange", "Black"],
    },
    {
      name: "Urban Cruiser Taisor",
      colours: ["Entertainer Orange", "Sportin Red", "Cafe White", "Sterling Silver", "Gaming Grey", "Black"],
    },
    {
      name: "Urban Cruiser HyRyder",
      colours: ["Sportin Red", "Cafe White", "Sterling Silver", "Gaming Grey", "Sprayed Teal", "Blackish Agave", "Black"],
    },
    {
      name: "Urban Cruiser Ebella",
      colours: ["Cafe White", "Entertainer Orange", "Sportin Red", "Sterling Silver", "Gaming Grey", "Black"],
    },
    {
      name: "Legender",
      colours: ["Super White", "Attitude Black", "Graphite Grey", "Phantom Brown", "Pearl White", "Bronze Mica"],
    },
    {
      name: "Land Cruiser 300",
      colours: ["Super White", "Attitude Black", "Graphite Grey", "Pearl White", "Silky White", "Dark Blue Mica", "Dark Red Mica", "Fine Silver"],
    },
    {
      name: "Vellfire",
      colours: ["Super White", "Attitude Black", "Graphite Grey", "Dark Blue Mica", "Precious Bronze", "Platinum White Pearl", "Silver", "Red Mica Metallic"],
    },
    {
      name: "Land Cruiser Prado",
      colours: ["Super White", "Attitude Black", "Graphite Grey", "Pearl White", "Dark Blue Mica", "Dark Red Mica", "Fine Silver", "Silky White"],
    },
  ];

  // Upsert models, then batch-insert all colours for each model
  for (const m of catalogue) {
    const model = await prisma.model.upsert({
      where: { name: m.name },
      update: {},
      create: { name: m.name },
    });

    // Batch create all colours in one query — skipDuplicates handles re-runs
    await prisma.colour.createMany({
      data: m.colours.map((name) => ({ name, modelId: model.id })),
      skipDuplicates: true,
    });

    console.log(`  ✓ ${m.name} (${m.colours.length} colours)`);
  }

  console.log(`\nSeeding complete! ${catalogue.length} models seeded.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
