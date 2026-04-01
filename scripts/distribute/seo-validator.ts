/**
 * seo-validator.ts — Validate SEO quality of a blog post before distribution
 *
 * Usage:
 *   npx tsx scripts/distribute/seo-validator.ts scripts/blog/drafts/my-post.json
 */

import * as fs from "fs";
import * as path from "path";

interface ValidationResult {
  type: "fail" | "warn";
  message: string;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/<!--.*?-->/g, " ").replace(/\s+/g, " ").trim();
}

function countWords(html: string): number {
  return stripHtml(html).split(/\s+/).filter(Boolean).length;
}

function countMatches(html: string, pattern: RegExp): number {
  return (html.match(pattern) || []).length;
}

function validate(data: Record<string, unknown>): ValidationResult[] {
  const results: ValidationResult[] = [];
  const content = (data.content as string) || "";
  const title = (data.title as string) || "";
  const slug = (data.slug as string) || "";
  const excerpt = (data.excerpt as string) || "";
  const metaTitle = (data.metaTitle as string) || "";
  const metaDescription = (data.metaDescription as string) || "";
  const tags = (data.tags as string[]) || [];
  const coverImage = data.coverImage as string | null;

  // --- HARD FAILS ---

  if (title.length > 60) {
    results.push({ type: "fail", message: `Title is ${title.length} chars (max 60)` });
  }

  if (!metaDescription) {
    results.push({ type: "fail", message: "Meta description is missing" });
  } else if (metaDescription.length > 160) {
    results.push({ type: "fail", message: `Meta description is ${metaDescription.length} chars (max 160)` });
  }

  if (/[A-Z\s]/.test(slug)) {
    results.push({ type: "fail", message: "Slug contains uppercase or spaces" });
  }

  const wordCount = countWords(content);
  if (wordCount < 800) {
    results.push({ type: "fail", message: `Content is ${wordCount} words (min 800)` });
  }

  const h2Count = countMatches(content, /<h2[\s>]/gi);
  if (h2Count === 0) {
    results.push({ type: "fail", message: "No <h2> tags found in content" });
  }

  const internalLinks = countMatches(content, /<!-- INTERNAL LINK:/gi);
  if (internalLinks === 0) {
    results.push({ type: "fail", message: "No internal link placeholders (<!-- INTERNAL LINK: -->) found" });
  }

  if (!excerpt) {
    results.push({ type: "fail", message: "Excerpt is missing" });
  }

  // --- WARNINGS ---

  if (tags.length > 0 && !title.toLowerCase().includes(tags[0].replace(/-/g, " "))) {
    results.push({ type: "warn", message: `Title doesn't contain the first tag "${tags[0]}" as keyword` });
  }

  if (excerpt && excerpt.length > 280) {
    results.push({ type: "warn", message: `Excerpt is ${excerpt.length} chars (recommended max 280)` });
  }

  if (h2Count < 3) {
    results.push({ type: "warn", message: `Only ${h2Count} <h2> tag(s) found (recommended 3+)` });
  }

  const blockquoteCount = countMatches(content, /<blockquote[\s>]/gi);
  if (blockquoteCount === 0) {
    results.push({ type: "warn", message: "No <blockquote> found in content" });
  }

  const listCount = countMatches(content, /<(ul|ol)[\s>]/gi);
  if (listCount === 0) {
    results.push({ type: "warn", message: "No <ul> or <ol> list found in content" });
  }

  if (!coverImage) {
    results.push({ type: "warn", message: "Cover image is null" });
  }

  if (tags.length < 3) {
    results.push({ type: "warn", message: `Only ${tags.length} tag(s) (recommended 3+)` });
  }

  if (metaTitle && metaTitle === title) {
    results.push({ type: "warn", message: "Meta title is same as title (not customised)" });
  }

  return results;
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === "--help") {
    console.log("Usage: npx tsx scripts/distribute/seo-validator.ts <path-to-post.json>");
    process.exit(0);
  }

  const jsonPath = path.resolve(args[0]);
  if (!fs.existsSync(jsonPath)) {
    console.error(`Error: File not found: ${jsonPath}`);
    process.exit(1);
  }

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  } catch (e) {
    console.error(`Error: Failed to parse JSON: ${(e as Error).message}`);
    process.exit(1);
  }

  const results = validate(data);
  const fails = results.filter((r) => r.type === "fail");
  const warns = results.filter((r) => r.type === "warn");

  // Score: start at 10, subtract 2 per hard fail, 1 per warning
  const score = Math.max(0, 10 - fails.length * 2 - warns.length);

  console.log("\n  SEO Validation Report");
  console.log("  " + "=".repeat(40));
  console.log(`  Post: ${data.title}`);
  console.log(`  Slug: ${data.slug}`);
  console.log(`  Words: ${countWords((data.content as string) || "")}`);
  console.log("");

  if (fails.length > 0) {
    console.log("  HARD FAILS (must fix):");
    fails.forEach((f) => console.log(`    ✗  ${f.message}`));
    console.log("");
  }

  if (warns.length > 0) {
    console.log("  WARNINGS:");
    warns.forEach((w) => console.log(`    ⚠  ${w.message}`));
    console.log("");
  }

  if (fails.length === 0 && warns.length === 0) {
    console.log("  No issues found.\n");
  }

  console.log(`  Readiness Score: ${score}/10`);
  if (score >= 7) {
    console.log("  ✓  Ready to distribute\n");
  } else {
    console.log("  ✗  Fix issues before distributing\n");
  }

  process.exit(fails.length > 0 ? 1 : 0);
}

main();
