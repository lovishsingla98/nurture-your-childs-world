import { Helmet } from "react-helmet-async";
import { getCanonicalUrl } from "@/lib/seo";
import type { Post } from "@/types/blog";

interface PostSEOProps {
  post: Post;
}

export function PostSEO({ post }: PostSEOProps) {
  const title = post.metaTitle || post.title;
  const description = post.metaDescription || post.excerpt;
  const fullUrl = getCanonicalUrl(`/blog/${post.slug}`);
  const publishedDate = post.publishedAt?.toDate().toISOString() ?? "";
  const modifiedDate = post.updatedAt?.toDate().toISOString() ?? "";

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    image: post.coverImage || undefined,
    datePublished: publishedDate,
    dateModified: modifiedDate,
    author: {
      "@type": "Organization",
      name: "Cortiq Labs",
    },
    publisher: {
      "@type": "Organization",
      name: "Nurture",
    },
    description,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": fullUrl,
    },
  };

  return (
    <Helmet>
      <title>{`${title} — Nurture`}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph */}
      <meta property="og:type" content="article" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={fullUrl} />
      {post.coverImage && <meta property="og:image" content={post.coverImage} />}

      {/* Article meta */}
      {publishedDate && (
        <meta property="article:published_time" content={publishedDate} />
      )}
      {modifiedDate && (
        <meta property="article:modified_time" content={modifiedDate} />
      )}
      {post.categories?.map((cat) => (
        <meta property="article:section" content={cat} key={cat} />
      ))}
      {post.tags?.map((tag) => (
        <meta property="article:tag" content={tag} key={tag} />
      ))}

      {/* Structured data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
}

interface BlogListSEOProps {
  category?: string;
}

export function BlogListSEO({ category }: BlogListSEOProps) {
  const title = category
    ? `${category} Blog Posts — Nurture`
    : "Blog — Nurture";
  const description = category
    ? `Read our latest ${category.toLowerCase()} articles and insights.`
    : "Explore parenting tips, child development insights, and more from Nurture.";

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={getCanonicalUrl("/blog")} />
    </Helmet>
  );
}
