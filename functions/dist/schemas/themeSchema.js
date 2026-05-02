"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeSchema = exports.DESIGN_PALETTE = void 0;
const zod_1 = require("zod");
// Centralized source of truth for design palette
exports.DESIGN_PALETTE = {
    primary: '#4A90E2',
    secondary: '#50E3C2',
    accent: '#F5A623',
    text: '#333333',
};
// Zod schema for strict theme data validation with CORRECTED regex
exports.ThemeSchema = zod_1.z.object({
    primary: zod_1.z.string().regex(/^#[0-9a-fA-F]{6}$/),
    secondary: zod_1.z.string().regex(/^#[0-9a-fA-F]{6}$/),
    accent: zod_1.z.string().regex(/^#[0-9a-fA-F]{6}$/),
    text: zod_1.z.string().regex(/^#[0-9a-fA-F]{6}$/),
});
