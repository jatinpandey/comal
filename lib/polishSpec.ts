import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

// Read the spec at module load. In dev, saving polish.md triggers a
// module reload; in prod the file is bundled with the deployment via
// next.config.ts `outputFileTracingIncludes`.

const SPEC_PATH = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "prompts",
  "polish.md"
);

export const POLISH_SPEC = readFileSync(SPEC_PATH, "utf8");
