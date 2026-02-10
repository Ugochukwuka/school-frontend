/**
 * Animation utility functions for consistent timing and easing
 */

export const easings = {
  easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  easeOut: "cubic-bezier(0.0, 0, 0.2, 1)",
  easeIn: "cubic-bezier(0.4, 0, 1, 1)",
  spring: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
} as const;

export const durations = {
  fast: 200,
  normal: 300,
  slow: 500,
  slower: 700,
} as const;

/**
 * Generate stagger delay for animations
 */
export function getStaggerDelay(index: number, baseDelay: number = 100): number {
  return index * baseDelay;
}

/**
 * Calculate animation duration based on distance
 */
export function getDuration(distance: number, baseSpeed: number = 0.5): number {
  return Math.min(1000, Math.max(200, distance * baseSpeed));
}

