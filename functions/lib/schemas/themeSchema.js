"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeSchema = exports.DESIGN_PALETTE = void 0;
const zod_1 = require("zod");
// Centralized source of truth for design palette based on design.md
exports.DESIGN_PALETTE = {
    colors: {
        primary: '#FFCC00', // Primary Gold
        text: '#1B1C1C', // Deep Charcoal
        background: '#FCF9F8', // Pure White
        surface: '#F6F3F2', // Surface Grey
        success: '#27AE60' // Verification Green
    }
};
// Zod schema for strict theme data validation
exports.ThemeSchema = zod_1.z.object({
    colors: zod_1.z.object({
        primary: zod_1.z.string().regex(/^#[0-9a-fA-F]{6}$/),
        text: zod_1.z.string().regex(/^#[0-9a-fA-F]{6}$/),
        background: zod_1.z.string().regex(/^#[0-9a-fA-F]{6}$/),
        surface: zod_1.z.string().regex(/^#[0-9a-fA-F]{6}$/),
        success: zod_1.z.string().regex(/^#[0-9a-fA-F]{6}$/)
    })
});
