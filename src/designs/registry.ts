import { DesignDefinition, DesignMeta } from "./types";
import { ivoryLightDesign } from "./ivory-light";
import { wixBoldDesign } from "./wix-bold";

// Global In-Memory Design Registry
const DESIGN_REGISTRY: Record<string, DesignDefinition> = {
  "ivory-light": ivoryLightDesign,
  "wix-bold": wixBoldDesign,
};

export const DEFAULT_DESIGN_ID = "ivory-light";

/**
 * Retrieve a design definition by ID with safe fallback to default.
 */
export function getDesign(id?: string): DesignDefinition {
  if (id && DESIGN_REGISTRY[id]) {
    return DESIGN_REGISTRY[id];
  }
  return DESIGN_REGISTRY[DEFAULT_DESIGN_ID];
}

/**
 * List metadata for all registered designs.
 */
export function getAllDesigns(): DesignMeta[] {
  return Object.values(DESIGN_REGISTRY).map((d) => d.meta);
}

/**
 * Check if a design ID is registered.
 */
export function isDesignAvailable(id: string): boolean {
  return !!DESIGN_REGISTRY[id];
}
