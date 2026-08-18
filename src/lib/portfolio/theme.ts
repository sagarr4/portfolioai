// Shared hue-selection logic so the site's color palette and any enhanced
// photo background are always drawn from the same seed -- never mismatched.

export const HUE_FAMILIES = [
  'electric blue', 'emerald green', 'violet', 'amber/gold',
  'rose/coral', 'teal/cyan', 'crimson/red', 'lime/chartreuse'
]

export function pickHueFamily(seed: number): string {
  return HUE_FAMILIES[seed % HUE_FAMILIES.length]
}
