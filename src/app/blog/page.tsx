import { allPosts } from "content-collections";

import { PostCover } from "@/components/post-cover";
import { DATA } from "@/data/resume";
import Link from "next/link";
import type { Metadata } from "next";
import { paginate, normalizePage } from "@/lib/pagination";
import { Reveal } from "@/components/motion/reveal";
import { ItemList, ItemRow } from "@/components/section/section-row";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Notes from the build — an MCP server, a hiring pipeline, an admissions portal, and how the whole lifecycle gets run.",
  alternates: { canonical: `${DATA.url}/blog` },
  openGraph: {
    title: `Blog | ${DATA.name}`,
    description: "Notes from the build.",
    url: `${DATA.url}/blog`,
    siteName: DATA.name,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `Blog | ${DATA.name}`,
    description: "Notes from the build.",
  },
};

const PAGE_SIZE = 8;

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;

  const sortedPosts = [...allPosts].sort(
    (a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt)
  );

  const totalPages = Math.ceil(sortedPosts.length / PAGE_SIZE);
  const currentPage = normalizePage(pageParam, totalPages);
  const { items: paginatedPosts, pagination } = paginate(sortedPosts, {
    page: currentPage,
    pageSize: PAGE_SIZE,
  });

  return (
    <div className="shell">
      <section className="pt-section pb-7">
        <Reveal kind="fade" className="label">
          Writing
        </Reveal>
        <Reveal delay={0.07}>
          <h1 className="mt-4 font-display text-[clamp(2.5rem,7vw,4rem)] leading-none font-semibold tracking-[-0.02em]">
            Notes from the build
          </h1>
        </Reveal>
        <Reveal kind="fade" delay={0.14}>
          <p className="mt-5 max-w-[54ch] text-muted-foreground">
            Written from systems I actually shipped &mdash; what the problem
            was, what I did about it, and what I&rsquo;d do differently.
          </p>
        </Reveal>
      </section>

      <div className="pb-16">
        {paginatedPosts.length > 0 ? (
          <>
            <Reveal>
              <ItemList>
                {paginatedPosts.map((post, i) => {
                  const slug = post._meta.path.replace(/\.mdx$/, "");
                  return (
                    <ItemRow
                      key={slug}
                      title={post.title}
                      href={`/blog/${slug}`}
                      cover={
                        <PostCover slug={slug} index={i} compact />
                      }
                      meta={new Date(post.publishedAt).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric", year: "numeric" }
                      )}
                    >
                      {post.summary}
                    </ItemRow>
                  );
                })}
              </ItemList>
            </Reveal>

            {pagination.totalPages > 1 && (
              <Reveal kind="fade" delay={0.1}>
                <div className="mt-8 flex flex-row items-center justify-between gap-3">
                  <span className="label">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <div className="flex gap-2">
                    <PageLink
                      href={`/blog?page=${pagination.page - 1}`}
                      enabled={pagination.hasPreviousPage}
                    >
                      Previous
                    </PageLink>
                    <PageLink
                      href={`/blog?page=${pagination.page + 1}`}
                      enabled={pagination.hasNextPage}
                    >
                      Next
                    </PageLink>
                  </div>
                </div>
              </Reveal>
            )}
          </>
        ) : (
          <Reveal kind="fade">
            <p className="text-muted-foreground">Nothing published yet.</p>
          </Reveal>
        )}
      </div>
    </div>
  );
}

function PageLink({
  href,
  enabled,
  children,
}: {
  href: string;
  enabled: boolean;
  children: React.ReactNode;
}) {
  const base =
    "label flex h-8 items-center rounded-[3px] border border-rule px-3 transition-colors";

  if (!enabled) {
    return (
      <span className={cn(base, "cursor-not-allowed opacity-40")}>
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className={cn(base, "hover:border-foreground/30 hover:text-foreground")}
    >
      {children}
    </Link>
  );
}
