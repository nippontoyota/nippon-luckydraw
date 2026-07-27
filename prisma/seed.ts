import { prisma } from "../src/lib/prisma";

async function main() {
  console.log('Seeding data...')

  // 1. Create Branches
  const branches = [
    { name: 'Kochi (Edappally)', location: 'Edappally', slug: 'kochi-edappally' },
    { name: 'Kochi (Kalamassery)', location: 'Kalamassery', slug: 'kochi-kalamassery' },
    { name: 'Trivandrum', location: 'Trivandrum', slug: 'trivandrum' },
    { name: 'Calicut', location: 'Calicut', slug: 'calicut' },
    { name: 'Thrissur', location: 'Thrissur', slug: 'thrissur' },
  ]

  for (const b of branches) {
    await prisma.branch.upsert({
      where: { slug: b.slug },
      update: {},
      create: b,
    })
  }

  // 2. Create Models & Colours
  const models = [
    {
      name: 'Innova Crysta',
      colours: ['Super White', 'Silver Metallic', 'Avant-garde Bronze Metallic', 'Attitude Black Mica'],
    },
    {
      name: 'Fortuner',
      colours: ['Attitude Black Mica', 'Super White', 'Grey Metallic', 'Silver Metallic'],
    },
    {
      name: 'Urban Cruiser Hyryder',
      colours: ['Cafe White', 'Enticing Silver', 'Gaming Grey', 'Sportin Red'],
    },
    {
      name: 'Glanza',
      colours: ['Cafe White', 'Enticing Silver', 'Gaming Grey', 'Sportin Red', 'Insta Blue'],
    },
  ]

  for (const m of models) {
    const model = await prisma.model.upsert({
      where: { name: m.name },
      update: {},
      create: { name: m.name },
    })

    for (const c of m.colours) {
      await prisma.colour.upsert({
        where: { modelId_name: { modelId: model.id, name: c } },
        update: {},
        create: { name: c, modelId: model.id },
      })
    }
  }

  console.log('Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
