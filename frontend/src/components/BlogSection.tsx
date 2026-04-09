import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Calendar, Clock, ArrowRight, ArrowLeft, Bookmark } from "lucide-react";
import {
  getPublicBlogCategories,
  getPublicBlogs,
  PublicBlogPost,
} from "../api/blog";
import "./BlogSection.css";
import { useI18n } from "../i18n/I18nContext";
import { localizeArrayFields } from "../i18n/dynamicI18n";

const ALL_CATEGORY_ID = "__all__";

type DetailContentBlock =
  | { kind: "heading"; value: string }
  | { kind: "quote"; value: string }
  | { kind: "code"; value: string }
  | { kind: "image"; value: string; alt: string }
  | { kind: "paragraph"; value: string };

function parseMarkdownImageLine(
  line: string,
): { alt: string; src: string } | null {
  const match = line.match(/^!\[([^\]]*)\]\((\S+)(?:\s+"[^"]*")?\)$/);
  if (!match) return null;

  const alt = match[1]?.trim() ?? "";
  let src = match[2]?.trim() ?? "";
  if (src.startsWith("<") && src.endsWith(">")) {
    src = src.slice(1, -1);
  }
  if (!src) return null;

  return { alt, src };
}

function renderInlineMarkdown(text: string): ReactNode[] {
  const pieces = text
    .split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g)
    .filter(Boolean);

  return pieces.map((piece, index) => {
    if (/^`[^`]+`$/.test(piece)) {
      return (
        <code key={`inline-code-${index}`} className="blog-detail-inline-code">
          {piece.slice(1, -1)}
        </code>
      );
    }
    if (/^\*\*[^*]+\*\*$/.test(piece)) {
      return (
        <strong key={`inline-strong-${index}`}>{piece.slice(2, -2)}</strong>
      );
    }
    if (/^\*[^*]+\*$/.test(piece)) {
      return <em key={`inline-em-${index}`}>{piece.slice(1, -1)}</em>;
    }
    return <span key={`inline-text-${index}`}>{piece}</span>;
  });
}

function parseDetailContent(content?: string | null): DetailContentBlock[] {
  const raw = (content ?? "").trim();
  if (!raw) return [];

  // Compatibilidad con posts antiguos guardados como JSON por bloques.
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed
        .filter((item) => item && typeof item === "object")
        .map((item) => {
          const type = typeof item.type === "string" ? item.type : "paragraph";
          const value = typeof item.value === "string" ? item.value.trim() : "";
          if (!value) return null;
          if (type === "heading")
            return { kind: "heading", value } as DetailContentBlock;
          if (type === "quote")
            return { kind: "quote", value } as DetailContentBlock;
          if (type === "code")
            return { kind: "code", value } as DetailContentBlock;
          if (type === "image") {
            return {
              kind: "image",
              value,
              alt: "Imagen de contenido",
            } as DetailContentBlock;
          }
          return { kind: "paragraph", value } as DetailContentBlock;
        })
        .filter((block): block is DetailContentBlock => Boolean(block));
    }
  } catch {
    // Si no es JSON, se interpreta como documento de texto formateado.
  }

  const blocks: DetailContentBlock[] = [];
  const lines = raw.split(/\r?\n/);
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line) {
      i += 1;
      continue;
    }

    if (line.startsWith("```")) {
      const codeLines: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i += 1;
      }
      blocks.push({ kind: "code", value: codeLines.join("\n") });
      i += 1;
      continue;
    }

    const imageData = parseMarkdownImageLine(line);
    if (imageData) {
      blocks.push({
        kind: "image",
        value: imageData.src,
        alt: imageData.alt || "Imagen de contenido",
      });
      i += 1;
      continue;
    }

    if (
      line.startsWith("# ") ||
      line.startsWith("## ") ||
      line.startsWith("### ")
    ) {
      blocks.push({ kind: "heading", value: line.replace(/^#{1,3}\s+/, "") });
      i += 1;
      continue;
    }

    if (line.startsWith(">")) {
      blocks.push({ kind: "quote", value: line.replace(/^>\s?/, "") });
      i += 1;
      continue;
    }

    const paragraphLines: string[] = [line];
    i += 1;
    while (i < lines.length) {
      const next = lines[i].trim();
      if (
        !next ||
        next.startsWith("#") ||
        next.startsWith(">") ||
        next.startsWith("```") ||
        Boolean(parseMarkdownImageLine(next))
      ) {
        break;
      }
      paragraphLines.push(next);
      i += 1;
    }
    blocks.push({ kind: "paragraph", value: paragraphLines.join(" ") });
  }

  return blocks;
}

export function BlogSection() {
  const { t, locale, language } = useI18n();
  const [posts, setPosts] = useState<PublicBlogPost[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORY_ID);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const previousSelectedPostIdRef = useRef<number | null>(null);
  const listScrollPositionRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    const loadBlog = async () => {
      setLoading(true);
      setError(null);
      try {
        const [postsData, categoriesData] = await Promise.all([
          getPublicBlogs(),
          getPublicBlogCategories(),
        ]);

        if (cancelled) return;

        const localizedPosts = localizeArrayFields(
          postsData as Array<Record<string, unknown>>,
          language,
          [
            "title",
            "slug",
            "excerpt",
            "content",
            "seo_title",
            "seo_description",
          ],
        ).map((post) => ({
          ...post,
          category: post.category
            ? localizeArrayFields(
                [post.category as Record<string, unknown>],
                language,
                ["name"],
              )[0]
            : post.category,
          tags: (post.tags ?? []).map(
            (tag) =>
              localizeArrayFields([tag as Record<string, unknown>], language, [
                "name",
                "slug",
              ])[0],
          ),
        })) as PublicBlogPost[];

        const localizedCategories = localizeArrayFields(
          categoriesData as Array<Record<string, unknown>>,
          language,
          ["name"],
        );

        // Filtrar categorías vacías (que no tienen posts asociados)
        const categoriesWithPosts = new Set<number>(
          localizedPosts
            .map((post) => post.category_id)
            .filter((id) => id !== null && id !== undefined),
        );

        const filteredCategories = localizedCategories
          .filter((cat) => categoriesWithPosts.has(cat.id))
          .map((category) => String(category.name || ""));

        setPosts(localizedPosts);
        setCategories(filteredCategories);
      } catch {
        if (!cancelled) {
          setError(t("blog.error"));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadBlog();
    return () => {
      cancelled = true;
    };
  }, [language, t]);

  const normalizedPosts = useMemo(() => {
    return posts.map((post) => {
      const sourceForReading = (post.content || post.excerpt || "").trim();
      const wordCount = sourceForReading.split(/\s+/).filter(Boolean).length;
      const computedReadTime = Math.max(1, Math.ceil(wordCount / 180));
      const formattedDate = new Date(post.date).toLocaleDateString(locale, {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

      return {
        ...post,
        excerpt: post.excerpt,
        category: post.category?.name ?? "General",
        dateLabel: formattedDate,
        readTimeLabel: `${post.read_time_minutes || computedReadTime} ${t("blog.reading")}`,
      };
    });
  }, [posts, locale, t]);

  const selectedPost = useMemo(
    () => normalizedPosts.find((post) => post.id === selectedPostId) ?? null,
    [normalizedPosts, selectedPostId],
  );

  const selectedPostContentBlocks = useMemo(() => {
    return parseDetailContent(selectedPost?.content);
  }, [selectedPost]);

  const suggestedRecentPosts = useMemo(() => {
    if (!selectedPost) return [] as typeof normalizedPosts;

    const candidates = normalizedPosts.filter(
      (post) => post.id !== selectedPost.id,
    );

    const byDateDesc = (
      a: (typeof normalizedPosts)[number],
      b: (typeof normalizedPosts)[number],
    ) => new Date(b.date).getTime() - new Date(a.date).getTime();

    const sameCategory = candidates
      .filter((post) => post.category === selectedPost.category)
      .sort(byDateDesc);

    const otherRecent = candidates
      .filter((post) => post.category !== selectedPost.category)
      .sort(byDateDesc);

    return [...sameCategory, ...otherRecent].slice(0, 5);
  }, [normalizedPosts, selectedPost]);

  const isDetailViewOpen = Boolean(selectedPost);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const previousSelectedPostId = previousSelectedPostIdRef.current;

    if (selectedPostId !== null) {
      if (previousSelectedPostId === null) {
        listScrollPositionRef.current = window.scrollY;
      }

      window.requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: "auto" });
      });
    } else if (previousSelectedPostId !== null) {
      window.requestAnimationFrame(() => {
        window.scrollTo({
          top: listScrollPositionRef.current,
          behavior: "auto",
        });
      });
    }

    previousSelectedPostIdRef.current = selectedPostId;
  }, [selectedPostId]);

  const categoryFilteredPosts = useMemo(() => {
    if (activeCategory === ALL_CATEGORY_ID) {
      return normalizedPosts;
    }
    return normalizedPosts.filter((post) => post.category === activeCategory);
  }, [activeCategory, normalizedPosts]);

  const featuredByFlag = categoryFilteredPosts.filter(
    (post) => post.is_featured,
  );
  const regularByFlag = categoryFilteredPosts.filter(
    (post) => !post.is_featured,
  );
  const featuredPosts = (
    featuredByFlag.length > 0 ? featuredByFlag : categoryFilteredPosts
  ).slice(0, 2);
  const regularPosts =
    featuredByFlag.length > 0 ? regularByFlag : categoryFilteredPosts.slice(2);

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      Tecnología:
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      React: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300",
      Backend:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      TypeScript:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      Diseño: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
    };
    return (
      colors[category] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    );
  };

  return (
    <div className="relative min-h-screen">
      {!isDetailViewOpen && (
        <div className="section-shell min-h-screen p-4 lg:p-6 transition-all duration-300 opacity-100 translate-x-0">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8 lg:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
                {t("blog.title")}
              </h2>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
                {t("blog.subtitle")}
              </p>
            </div>

            {/* Filtros de categoría */}
            <div className="blog-filter-wrap flex flex-wrap justify-center gap-2 mb-6 lg:mb-8 px-4">
              <Button
                key={ALL_CATEGORY_ID}
                variant={
                  ALL_CATEGORY_ID === activeCategory ? "default" : "outline"
                }
                size="sm"
                className="blog-filter-btn"
                onClick={() => setActiveCategory(ALL_CATEGORY_ID)}
              >
                {t("blog.all")}
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={category === activeCategory ? "default" : "outline"}
                  size="sm"
                  className="blog-filter-btn"
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>

            {loading && (
              <Card className="mx-4 lg:mx-0">
                <CardContent className="py-12 text-center text-muted-foreground">
                  {t("blog.loading")}
                </CardContent>
              </Card>
            )}

            {!loading && error && (
              <Card className="mx-4 lg:mx-0">
                <CardContent className="py-12 text-center text-red-500">
                  {error}
                </CardContent>
              </Card>
            )}

            {!loading && !error && categoryFilteredPosts.length === 0 && (
              <Card className="mx-4 lg:mx-0">
                <CardContent className="py-12 text-center text-muted-foreground">
                  {t("blog.empty")}
                </CardContent>
              </Card>
            )}

            {/* Artículos destacados */}
            {!loading && !error && featuredPosts.length > 0 && (
              <div className="blog-featured-section space-y-5 lg:space-y-6 mb-8 lg:mb-10">
                <h3 className="text-xl sm:text-2xl font-semibold px-4 lg:px-0">
                  {t("blog.featured")}
                </h3>
                <div className="grid lg:grid-cols-2 gap-5 lg:gap-6">
                  {featuredPosts.map((post) => (
                    <Card
                      key={post.id}
                      className="blog-featured-card overflow-hidden group hover:shadow-lg transition-all duration-300"
                    >
                      <ImageWithFallback
                        src={post.image}
                        alt={post.title}
                        className="blog-featured-image w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <CardContent className="blog-featured-content p-5">
                        <div className="blog-featured-meta-row flex items-center gap-3 mb-3">
                          <Badge className={getCategoryColor(post.category)}>
                            {post.category}
                          </Badge>
                          <div className="blog-featured-meta flex items-center text-sm text-muted-foreground gap-3">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {post.dateLabel}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {post.readTimeLabel}
                            </span>
                          </div>
                        </div>

                        <h3 className="blog-featured-title text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                          {post.title}
                        </h3>
                        <p className="blog-featured-excerpt text-muted-foreground mb-3 line-clamp-3">
                          {post.excerpt}
                        </p>

                        <div className="blog-featured-actions flex items-center justify-between">
                          <Button
                            variant="ghost"
                            className="blog-featured-readmore p-0"
                            onClick={() => setSelectedPostId(post.id)}
                          >
                            {t("blog.readMore")}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="blog-featured-bookmark"
                          >
                            <Bookmark className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Todos los artículos */}
            {!loading && !error && regularPosts.length > 0 && (
              <div className="space-y-6">
                <h3 className="text-xl sm:text-2xl font-semibold px-4 lg:px-0">
                  {t("blog.allArticles")}
                </h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {regularPosts.map((post) => (
                    <Card
                      key={post.id}
                      className="blog-compact-card overflow-hidden group hover:shadow-md transition-shadow"
                    >
                      <div className="aspect-video">
                        <ImageWithFallback
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge
                            className={getCategoryColor(post.category)}
                            variant="outline"
                          >
                            {post.category}
                          </Badge>
                          <div className="flex items-center text-xs text-muted-foreground gap-2">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {post.dateLabel}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {post.readTimeLabel}
                            </span>
                          </div>
                        </div>

                        <h4 className="font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {post.excerpt}
                        </p>

                        <div className="flex items-center justify-between">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-0 h-auto"
                            onClick={() => setSelectedPostId(post.id)}
                          >
                            {t("blog.readMore")}
                            <ArrowRight className="ml-1 h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Bookmark className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* CTA para ver más */}
            {!loading && !error && categoryFilteredPosts.length > 0 && (
              <div className="text-center mt-12">
                <Button size="lg" variant="outline">
                  {t("blog.viewAll")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedPost && (
        <div className="section-shell blog-detail-page relative z-20 transition-all duration-300 opacity-100 translate-x-0 min-h-screen">
          <div className="blog-detail-scroll min-h-screen p-4 lg:p-6">
            <div className="blog-detail-shell mx-auto max-w-6xl">
              <div className="blog-detail-back-row mb-6">
                <Button
                  variant="ghost"
                  className="blog-detail-back-button inline-flex items-center gap-2"
                  onClick={() => setSelectedPostId(null)}
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t("blog.back")}
                </Button>
              </div>

              <div className="blog-detail-layout">
                <article className="blog-detail-article space-y-6">
                  <header className="blog-detail-header space-y-3">
                    <h1 className="blog-detail-title">{selectedPost.title}</h1>
                    <div className="blog-detail-meta">
                      <Badge
                        className={`blog-detail-category ${getCategoryColor(selectedPost.category)}`}
                      >
                        {selectedPost.category}
                      </Badge>
                      <span className="blog-detail-meta-item">
                        <Calendar className="h-3 w-3" />
                        {selectedPost.dateLabel}
                      </span>
                      <span className="blog-detail-meta-separator">•</span>
                      <span className="blog-detail-meta-item">
                        <Clock className="h-3 w-3" />
                        {selectedPost.readTimeLabel}
                      </span>
                    </div>
                  </header>

                  <div className="blog-detail-hero overflow-hidden rounded-xl border">
                    <ImageWithFallback
                      src={selectedPost.image}
                      alt={selectedPost.title}
                      className="blog-detail-hero-image"
                    />
                  </div>

                  <p className="blog-detail-dek">{selectedPost.excerpt}</p>

                  {selectedPostContentBlocks.length > 0 ? (
                    <div className="blog-detail-content">
                      {selectedPostContentBlocks.map((block, index) => {
                        if (block.kind === "heading") {
                          return (
                            <h2
                              key={`${selectedPost.id}-heading-${index}`}
                              className="blog-detail-heading"
                            >
                              {renderInlineMarkdown(block.value)}
                            </h2>
                          );
                        }

                        if (block.kind === "quote") {
                          return (
                            <blockquote
                              key={`${selectedPost.id}-quote-${index}`}
                              className="blog-detail-quote"
                            >
                              {renderInlineMarkdown(block.value)}
                            </blockquote>
                          );
                        }

                        if (block.kind === "code") {
                          return (
                            <pre
                              key={`${selectedPost.id}-code-${index}`}
                              className="blog-detail-code"
                            >
                              <code>{block.value}</code>
                            </pre>
                          );
                        }

                        if (block.kind === "image") {
                          return (
                            <figure
                              key={`${selectedPost.id}-image-${index}`}
                              className="blog-detail-content-figure"
                            >
                              <ImageWithFallback
                                src={block.value}
                                alt={
                                  block.alt ||
                                  `${selectedPost.title} - imagen ${index + 1}`
                                }
                                className="blog-detail-content-image"
                              />
                            </figure>
                          );
                        }

                        return (
                          <p
                            key={`${selectedPost.id}-paragraph-${index}`}
                            className="blog-detail-paragraph"
                          >
                            {renderInlineMarkdown(block.value)}
                          </p>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="blog-detail-paragraph">
                      {selectedPost.excerpt}
                    </p>
                  )}
                </article>

                {suggestedRecentPosts.length > 0 && (
                  <aside
                    className="blog-detail-rail"
                    aria-label={t("blog.suggestedRecent")}
                  >
                    <div className="blog-detail-rail-panel">
                      <p className="blog-detail-rail-eyebrow">
                        {t("blog.continueReading")}
                      </p>
                      <h3 className="blog-detail-rail-title">
                        {t("blog.suggestedRecent")}
                      </h3>

                      <div className="blog-detail-rail-list">
                        {suggestedRecentPosts.map((post) => {
                          const isSameCategory =
                            post.category === selectedPost.category;
                          return (
                            <button
                              key={post.id}
                              type="button"
                              className="blog-detail-rail-item"
                              onClick={() => setSelectedPostId(post.id)}
                            >
                              <div className="blog-detail-rail-item-body">
                                <div className="blog-detail-rail-thumb-wrap">
                                  <ImageWithFallback
                                    src={post.image}
                                    alt={post.title}
                                    className="blog-detail-rail-thumb"
                                  />
                                </div>

                                <div className="blog-detail-rail-item-content">
                                  <div className="blog-detail-rail-item-top">
                                    <span className="blog-detail-rail-badge">
                                      {isSameCategory
                                        ? t("blog.related")
                                        : t("blog.recent")}
                                    </span>
                                    <span className="blog-detail-rail-date">
                                      {post.dateLabel}
                                    </span>
                                  </div>
                                  <p className="blog-detail-rail-item-title">
                                    {post.title}
                                  </p>
                                  <div className="blog-detail-rail-meta">
                                    <span>{post.category}</span>
                                    <span>•</span>
                                    <span>{post.readTimeLabel}</span>
                                  </div>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </aside>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
