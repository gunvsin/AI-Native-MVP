
import { z } from 'zod';

// Centralized source of truth for design palette based on design.md
export const DESIGN_PALETTE = {
  colors: {
    primary: '#FFCC00',      // Primary Gold
    text: '#1B1C1C',          // Deep Charcoal
    background: '#FCF9F8',    // Pure White
    surface: '#F6F3F2',       // Surface Grey
    success: '#27AE60'        // Verification Green
  }
};

// Zod schema for strict theme data validation
export const ThemeSchema = z.object({
  colors: z.object({
    primary: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    text: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    background: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    surface: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    success: z.string().regex(/^#[0-9a-fA-F]{6}$/)
  })
});

export type Theme = z.infer<typeof ThemeSchema>;
