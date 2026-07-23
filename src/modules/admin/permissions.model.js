import mongoose from "mongoose";

const { Schema, model } = mongoose;

/**
 * Catalog of admin console module permissions.
 * Sub-admins store granted permission `name` values on User.permissions[].
 */
const permissionSchema = new Schema(
    {
        /** Machine key, e.g. "warehouses_vendors" */
        key: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },

        /** Display label shown in User Management UI */
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        description: {
            type: String,
            default: "",
            trim: true,
        },

        /** Sidebar section, e.g. "VENDORS & KYC" */
        group: {
            type: String,
            default: "GENERAL",
            trim: true,
        },

        /** Frontend route this permission unlocks */
        route: {
            type: String,
            default: "",
            trim: true,
        },

        sortOrder: {
            type: Number,
            default: 0,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

/** Canonical permission catalog — mirrors admin sidebar modules */
export const DEFAULT_PERMISSIONS = [
    {
        key: "live_ops",
        name: "Live Ops",
        description: "Mission control dashboard and live operations overview",
        group: "MISSION CONTROL",
        route: "/dashboard",
        sortOrder: 10,
    },
    {
        key: "demand_heat_map",
        name: "Demand Heat Map",
        description: "View and manage demand heat map",
        group: "MISSION CONTROL",
        route: "/demand-heat-map",
        sortOrder: 20,
    },
    {
        key: "live_map",
        name: "Live Map + Replay",
        description: "Live fleet map and route replay",
        group: "MISSION CONTROL",
        route: "/livemap",
        sortOrder: 30,
    },
    {
        key: "warehouses_vendors",
        name: "Warehouses & Vendors",
        description: "Manage warehouses and vendor accounts",
        group: "VENDORS & KYC",
        route: "/vendors",
        sortOrder: 40,
    },
    {
        key: "kyc_lifecycle",
        name: "KYC Lifecycle",
        description: "Review and manage vendor KYC lifecycle",
        group: "VENDORS & KYC",
        route: "/kyc",
        sortOrder: 50,
    },
    {
        key: "catalog",
        name: "Catalog",
        description: "Manage product catalog, brands and categories",
        group: "CATALOG",
        route: "/catalog",
        sortOrder: 60,
    },
    {
        key: "orders",
        name: "Orders",
        description: "View and manage order lifecycle",
        group: "ORDER LIFECYCLE & COMPLIANCE",
        route: "/orders",
        sortOrder: 70,
    },
    {
        key: "eway_bill",
        name: "E-Way Bill Review",
        description: "Review and approve e-way bills",
        group: "ORDER LIFECYCLE & COMPLIANCE",
        route: "/eway",
        sortOrder: 80,
    },
    {
        key: "returns_disputes",
        name: "Returns & Disputes",
        description: "Handle returns and dispute cases",
        group: "ORDER LIFECYCLE & COMPLIANCE",
        route: "/return",
        sortOrder: 90,
    },
    {
        key: "customers",
        name: "Customers",
        description: "View and manage customer accounts",
        group: "CUSTOMERS, DRIVERS & SUPPORT",
        route: "/customers",
        sortOrder: 100,
    },
    {
        key: "drivers_fleet",
        name: "Drivers & Fleet",
        description: "Manage drivers and fleet operations",
        group: "CUSTOMERS, DRIVERS & SUPPORT",
        route: "/drivers",
        sortOrder: 110,
    },
    {
        key: "support_tickets",
        name: "Support Tickets",
        description: "Handle support tickets and customer issues",
        group: "CUSTOMERS, DRIVERS & SUPPORT",
        route: "/support",
        sortOrder: 120,
    },
    {
        key: "revenue_margin",
        name: "Revenue & Margin",
        description: "View finance, revenue and margin analytics",
        group: "FINANCE & ANALYTICS",
        route: "/finance",
        sortOrder: 130,
    },
    {
        key: "broadcasts",
        name: "Broadcasts",
        description: "Create and send broadcast messages",
        group: "BROADCAST & GROWTH",
        route: "/broadcasts",
        sortOrder: 140,
    },
    {
        key: "promos_referrals",
        name: "Promos & Referrals",
        description: "Manage promotions and referral programs",
        group: "BROADCAST & GROWTH",
        route: "/promos",
        sortOrder: 150,
    },
    {
        key: "user_management",
        name: "User Management",
        description: "Manage sub admins and their permissions",
        group: "SETTINGS",
        route: "/users",
        sortOrder: 160,
    },
    {
        key: "platform_settings",
        name: "Platform Settings",
        description: "Configure platform and account settings",
        group: "SETTINGS",
        route: "/settings",
        sortOrder: 170,
    },
];

export default model("Permission", permissionSchema);
