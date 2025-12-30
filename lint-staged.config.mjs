/**
 * @type {import("lint-staged").Configuration}
 */
export default {
  "*": "biome check --write --no-errors-on-unmatched --files-ignore-unknown=true",
  "*.ts": "vitest related --run --passWithNoTests"
}
