import { allPosts } from "content-collections";
import { formatDate } from "@/lib/utils";
import { DATA } from "@/data/resume";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXContent } from "@content-collections/mdx/react";
import { mdxComponents } from "@/mdx-components";
import Link from "next/link";
import { CaseStudy } from "@/components/case-study";
import { Reveal } from "@/components/motion/reveal";
import { ChevronLeft, ChevronRight } from "lucide-react";

function getSortedPosts() {
  return [...allPosts].sort((a, b) => {
    if (new Date(a.publishedAt) > new Date(b.publishedAt)) {
      return -1;
    }
    return 1;
  });
}

export async function generateStaticParams() {
  return allPosts.map((post) => ({
    slug: post._meta.path.replace(/\.mdx$/, ""),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}): Promise<Metadata | undefined> {
  const { slug } = await params;
  const post = allPosts.find((p) => p._meta.path.replace(/\.mdx$/, "") === slug);

  if (!post) {
    return undefined;
  }

  let {
    title,
    publishedAt: publishedTime,
    summary: description,
    image,
  } = post;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime,
      url: `${DATA.url}/blog/${slug}`,
      ...(image && {
        images: [
          {
            url: `${DATA.url}${image}`,
          },
        ],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(image && {
        images: [`${DATA.url}${image}`],
      }),
    },
  };
}

export default async function Blog({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}) {
  const { slug } = await params;
  const sortedPosts = getSortedPosts();
  const currentIndex = sortedPosts.findIndex(
    (p) => p._meta.path.replace(/\.mdx$/, "") === slug
  );
  const post = sortedPosts[currentIndex];

  if (!post) {
    notFound();
  }

  const previousPost = currentIndex > 0 ? sortedPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < sortedPosts.length - 1 ? sortedPosts[currentIndex + 1] : null;

  const getSlug = (post: (typeof sortedPosts)[0]) =>
    post._meta.path.replace(/\.mdx$/, "");

  const jsonLdContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    description: post.summary,
    image: post.image
      ? `${DATA.url}${post.image}`
      : `${DATA.url}/blog/${slug}/opengraph-image`,
    url: `${DATA.url}/blog/${slug}`,
    author: {
      "@type": "Person",
      name: DATA.name,
    },
  }).replace(/</g, "\\u003c");

  return (
    <div className="mx-auto max-w-[760px] px-group pt-7 pb-20">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: jsonLdContent }}
      />

      <Reveal kind="fade">
        <Link
          href="/blog"
          className="label group inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
          aria-label="Back to all posts"
        >
          <ChevronLeft className="size-3 transition-transform group-hover:-translate-x-0.5" />
          All posts
        </Link>
      </Reveal>

      <Reveal delay={0.06}>
        <article className="glass mt-5 p-group md:p-entry">
          <h1 className="font-display text-[clamp(1.9rem,5vw,2.75rem)] leading-[1.08] font-semibold tracking-[-0.02em] text-balance">
            {post.title}
          </h1>
          <p className="label mt-5 text-ink-faint">
            {formatDate(post.publishedAt)}
          </p>

          {/* Above the prose on the pieces that have a before-and-after: the
              four beats someone deciding whether to read this needs. */}
          <CaseStudy
            problem={post.problem}
            constraint={post.constraint}
            decision={post.decision}
            outcome={post.outcome}
          />

          <div className="prose mt-8 max-w-full font-sans leading-relaxed text-pretty text-muted-foreground dark:prose-invert">
            <MDXContent code={post.mdx} components={mdxComponents} />
          </div>
        </article>
      </Reveal>

      <Reveal kind="fade" delay={0.1}>
        <nav className="mt-4 flex flex-col gap-3 sm:flex-row">
          {previousPost ? (
            <Link
              href={`/blog/${getSlug(previousPost)}`}
              className="glass glass-hover group flex flex-1 flex-col gap-1 p-4"
            >
              <span className="label flex items-center gap-1">
                <ChevronLeft className="size-3" />
                Previous
              </span>
              <span className="text-sm font-medium wrap-break-word">
                {previousPost.title}
              </span>
            </Link>
          ) : (
            <div className="hidden flex-1 sm:block" />
          )}

          {nextPost ? (
            <Link
              href={`/blog/${getSlug(nextPost)}`}
              className="glass glass-hover group flex flex-1 flex-col gap-1 p-4 text-right"
            >
              <span className="label flex items-center justify-end gap-1">
                Next
                <ChevronRight className="size-3" />
              </span>
              <span className="text-sm font-medium wrap-break-word">
                {nextPost.title}
              </span>
            </Link>
          ) : (
            <div className="hidden flex-1 sm:block" />
          )}
        </nav>
      </Reveal>
    </div>
  );
}
