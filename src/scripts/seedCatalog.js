import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

// Initialize env
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import Category from "../modules/category/category.model.js";
import SubCategory from "../modules/subCategory/subCategory.model.js";
import Brand from "../modules/brand/brand.model.js";
import Unit from "../modules/unit/unit.model.js";
import Attribute from "../modules/attribute/attribute.model.js";
import AttributeValue from "../modules/attributeValue/attributeValue.model.js";
import Product from "../modules/product/product.model.js";

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB...");

        // Wipe existing catalog data
        await Promise.all([
            Category.deleteMany(),
            SubCategory.deleteMany(),
            Brand.deleteMany(),
            Unit.deleteMany(),
            Attribute.deleteMany(),
            AttributeValue.deleteMany(),
            Product.deleteMany()
        ]);
        console.log("Cleared existing catalog data.");

        // 1. Categories
        const cementCat = await Category.create({ name: "Cement", slug: "cement", sortOrder: 1 });
        const steelCat = await Category.create({ name: "Steel / Sariya", slug: "steel-sariya", sortOrder: 2 });

        // 2. SubCategories
        const opcCat = await SubCategory.create({ categoryId: cementCat._id, name: "OPC 53", slug: "opc-53", displayOrder: 1 });
        const ppcCat = await SubCategory.create({ categoryId: cementCat._id, name: "PPC", slug: "ppc", displayOrder: 2 });
        const tmtCat = await SubCategory.create({ categoryId: steelCat._id, name: "TMT Bars", slug: "tmt-bars", displayOrder: 1 });

        // 3. Brands
        const ultratech = await Brand.create({ name: "UltraTech", slug: "ultratech" });
        const acc = await Brand.create({ name: "ACC", slug: "acc" });
        const tataTiscon = await Brand.create({ name: "Tata Tiscon", slug: "tata-tiscon" });

        // 4. Units
        const bagUnit = await Unit.create({ name: "Bag", shortName: "Bag", type: "Weight", isDecimal: false });
        const tonUnit = await Unit.create({ name: "Ton", shortName: "Ton", type: "Weight", isDecimal: true });
        const kgUnit = await Unit.create({ name: "Kilogram", shortName: "Kg", type: "Weight", isDecimal: true });

        // 5. Attributes
        const cementGrade = await Attribute.create({ categoryId: cementCat._id, name: "Grade", slug: "cement-grade", inputType: "select" });
        const steelDia = await Attribute.create({ categoryId: steelCat._id, name: "Diameter", slug: "steel-diameter", inputType: "select" });

        // 6. Attribute Values
        const grade53 = await AttributeValue.create({ attributeId: cementGrade._id, value: "53 Grade" });
        const grade43 = await AttributeValue.create({ attributeId: cementGrade._id, value: "43 Grade" });
        const dia8mm = await AttributeValue.create({ attributeId: steelDia._id, value: "8mm" });
        const dia12mm = await AttributeValue.create({ attributeId: steelDia._id, value: "12mm" });

        // 7. Products
        await Product.create({
            categoryId: cementCat._id,
            subCategoryId: opcCat._id,
            brandId: ultratech._id,
            name: "UltraTech OPC 53 Grade Cement",
            slug: "ultratech-opc-53-grade-cement",
            description: "High quality Ordinary Portland Cement.",
            attributeValueIds: [grade53._id]
        });

        await Product.create({
            categoryId: steelCat._id,
            subCategoryId: tmtCat._id,
            brandId: tataTiscon._id,
            name: "Tata Tiscon 550SD TMT Bar 8mm",
            slug: "tata-tiscon-550sd-tmt-bar-8mm",
            description: "Super Ductile high-strength TMT rebar.",
            attributeValueIds: [dia8mm._id]
        });

        console.log("✅ Seed Data Inserted Successfully!");
        process.exit();
    } catch (error) {
        console.error("❌ Seeding Failed: ", error);
        process.exit(1);
    }
};

seedDatabase();
