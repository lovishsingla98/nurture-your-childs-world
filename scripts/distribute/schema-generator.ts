/**
 * schema-generator.ts — Generate JSON-LD structured data for a blog post
 *
 * Outputs Article, FAQPage, and Speakable schemas.
 *
 * Usage:
 *   npx tsx scripts/distribute/schema-generator.ts scripts/blog/drafts/my-post.json
 */

import * as fs from "fs";
import * as path from "path";

const SITE_URL = "https://nurture.org.in";
const ORG_NAME = "Cortiq Labs";
const PRODUCT_NAME = "Nurture";

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/<!--.*?-->/g, " ").replace(/\s+/g, " ").trim();
}

function extractFaqPairs(html: string): { question: string; answer: string }[] {
  // Look for the FAQ section (h2 containing "frequently asked" or "FAQ")
  const faqSectionMatch = html.match(/<h2[^>]*>.*?(?:frequently asked|faq).*?<\/h2>([\s\S]*?)(?=<h2|$)/i);
  if (!faqSectionMatch) return [];

  const faqHtml = faqSectionMatch[1];
  const pairs: { question: string; answer: string }[] = [];

  // Extract h3 (question) + p (answer) pairs
  const pattern = /<h3[^>]*>([\s\S]*?)<\/h3>\s*<p[^>]*>([\s\S]*?)<\/p>/gi;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(faqHtml)) !== null) {
    pairs.push({
      question: stripHtml(match[1]),
      answer: stripHtml(match[2]),
    });
  }

  return pairs.slice(0, 4);
}

function generateArticleSchema(data: Record<string, unknown>): object {
  const title = data.title as string;
  const slug = data.slug as string;
  const excerpt = data.excerpt as string;
  const metaDescription = (data.metaDescription as string) || excerpt;
  const coverImage = data.coverImage as string | null;
  const tags = (data.tags as string[]) || [];

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: metaDescription,
    image: coverImage || undefined,
    author: {
      "@type": "Organization",
      name: ORG_NAME,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: PRODUCT_NAME,
      url: SITE_URL,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${slug}`,
    },
    url: `${SITE_URL}/blog/${slug}`,
    keywords: tags.join(", "),
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
  };
}

function generateFaqSchema(faqPairs: { question: string; answer: string }[]): object | null {
  if (faqPairs.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqPairs.map((pair) => ({
      "@type": "Question",
      name: pair.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: pair.answer,
      },
    })),
  };
}

function generateSpeakableSchema(data: Record<string, unknown>): object {
  const slug = data.slug as string;

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: data.title as string,
    url: `${SITE_URL}/blog/${slug}`,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: [".post-intro", "article p:first-of-type"],
    },
  };
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === "--help") {
    console.log("Usage: npx tsx scripts/distribute/schema-generator.ts <path-to-post.json>");
    console.log("\nGenerates Article, FAQ, and Speakable JSON-LD schemas.");
    console.log("Output saved to scripts/distribute/schemas/{slug}-schema.html");
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

  const content = (data.content as string) || "";
  const slug = (data.slug as string) || "unknown";
  const faqPairs = extractFaqPairs(content);

  // Generate schemas
  const articleSchema = generateArticleSchema(data);
  const faqSchema = generateFaqSchema(faqPairs);
  const speakableSchema = generateSpeakableSchema(data);

  // Build HTML output
  let html = `<!-- Structured Data for: ${data.title} -->\n`;
  html += `<!-- Generated: ${new Date().toISOString()} -->\n\n`;

  html += `<script type="application/ld+json">\n`;
  html += JSON.stringify(articleSchema, null, 2);
  html += `\n</script>\n\n`;

  if (faqSchema) {
    html += `<script type="application/ld+json">\n`;
    html += JSON.stringify(faqSchema, null, 2);
    html += `\n</script>\n\n`;
  } else {
    html += `<!-- No FAQ section found in content. Add an H2 "Frequently Asked Questions" section with H3 questions and P answers. -->\n\n`;
  }

  html += `<script type="application/ld+json">\n`;
  html += JSON.stringify(speakableSchema, null, 2);
  html += `\n</script>\n`;

  // Save output
  const outputDir = path.resolve("scripts/distribute/schemas");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const outputPath = path.join(outputDir, `${slug}-schema.html`);
  fs.writeFileSync(outputPath, html);

  console.log(`\n  Schema generated for: ${data.title}`);
  console.log(`  Output: ${outputPath}`);
  console.log(`  Schemas: Article${faqSchema ? " + FAQ" : " (no FAQ found)"} + Speakable`);

  if (faqPairs.length > 0) {
    console.log(`  FAQ pairs: ${faqPairs.length}`);
    faqPairs.forEach((p, i) => console.log(`    ${i + 1}. ${p.question}`));
  }

  console.log(`\n  Paste this into the PostSEO component's <Helmet> for slug "${slug}".`);
  console.log("");

  process.exit(0);
}

main();
