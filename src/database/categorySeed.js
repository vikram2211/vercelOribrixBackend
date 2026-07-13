import Category from "../modules/category/category.model.js";

const categories = [
  {
    name: "Cement",
    slug: "cement",
  },
  {
    name: "Steel / Sariya",
    slug: "steel-sariya",
  },
  {
    name: "Bricks & Blocks",
    slug: "bricks-blocks",
  },
  {
    name: "Sand & Aggregate",
    slug: "sand-aggregate",
  },
  {
    name: "Plumbing",
    slug: "plumbing",
  },
  {
    name: "Electricals",
    slug: "electricals",
  },
  {
    name: "Paint",
    slug: "paint",
  },
  {
    name: "Tools",
    slug: "tools",
  },
  {
    name: "Tiles",
    slug: "tiles",
  },
  {
    name: "Wood & Ply",
    slug: "wood-ply",
  },
  {
    name: "Hardware",
    slug: "hardware",
  },
  {
    name: "Safety gear",
    slug: "safety-gear",
  },
];

export const seedCategories = async () => {
  const count = await Category.countDocuments();

  if (count > 0) return;

  await Category.insertMany(categories);
  console.log("Categories seeded successfully!");
};
