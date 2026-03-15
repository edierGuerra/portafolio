import { useEffect, useMemo, useRef, useState } from "react";
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

export function BlogSection() {
  const [posts, setPosts] = useState<PublicBlogPost[]>([]);
  const [categories, setCategories] = useState<string[]>(["Todos"]);
  const [activeCategory, setActiveCategory] = useState("Todos");
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

        setPosts(postsData);
        setCategories([
          "Todos",
          ...categoriesData.map((category) => category.name),
        ]);
      } catch {
        if (!cancelled) {
          setError("No se pudieron cargar las publicaciones del blog.");
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
  }, []);

  const normalizedPosts = useMemo(() => {
    return posts.map((post) => {
      const sourceForReading = (post.content || post.excerpt || "").trim();
      const wordCount = sourceForReading.split(/\s+/).filter(Boolean).length;
      const computedReadTime = Math.max(1, Math.ceil(wordCount / 180));
      const formattedDate = new Date(post.date).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

      return {
        ...post,
        excerpt: post.excerpt,
        category: post.category?.name ?? "General",
        dateLabel: formattedDate,
        readTimeLabel: `${post.read_time_minutes || computedReadTime} min`,
      };
    });
  }, [posts]);

  const selectedPost = useMemo(
    () => normalizedPosts.find((post) => post.id === selectedPostId) ?? null,
    [normalizedPosts, selectedPostId],
  );

  const selectedPostContentBlocks = useMemo(() => {
    if (!selectedPost?.content?.trim()) {
      return [] as Array<{ type: string; value: string }>;
    }

    try {
      const parsed = JSON.parse(selectedPost.content);
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed
        .filter((item) => item && typeof item === "object")
        .map((item) => {
          const type = typeof item.type === "string" ? item.type : "paragraph";
          const value = typeof item.value === "string" ? item.value.trim() : "";
          return { type, value };
        })
        .filter((block) => block.value.length > 0);
    } catch {
      return [];
    }
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
    if (activeCategory === "Todos") {
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
        <div className="min-h-screen p-4 lg:p-6 transition-all duration-300 opacity-100 translate-x-0">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8 lg:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
                Blog
              </h2>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
                Reflexiones, tutoriales y experiencias del mundo del desarrollo
                y diseño
              </p>
            </div>

            {/* Filtros de categoría */}
            <div className="flex flex-wrap justify-center gap-2 mb-6 lg:mb-8 px-4">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={category === activeCategory ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>

            {loading && (
              <Card className="mx-4 lg:mx-0">
                <CardContent className="py-12 text-center text-muted-foreground">
                  Cargando publicaciones...
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
                  Aun no hay publicaciones para esta categoria.
                </CardContent>
              </Card>
            )}

            {/* Artículos destacados */}
            {!loading && !error && featuredPosts.length > 0 && (
              <div className="blog-featured-section space-y-5 lg:space-y-6 mb-8 lg:mb-10">
                <h3 className="text-xl sm:text-2xl font-semibold px-4 lg:px-0">
                  Artículos Destacados
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
                              {post.readTimeLabel} lectura
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
                            Leer más
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
                  Todos los Artículos
                </h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {regularPosts.map((post) => (
                    <Card
                      key={post.id}
                      className="overflow-hidden group hover:shadow-md transition-shadow"
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
                            Leer más
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
                  Ver todos los artículos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedPost && (
        <div className="blog-detail-page relative z-20 transition-all duration-300 opacity-100 translate-x-0 min-h-screen">
          <div className="blog-detail-scroll min-h-screen p-4 lg:p-6">
            <div className="blog-detail-shell mx-auto max-w-6xl">
              <div className="blog-detail-back-row mb-6">
                <Button
                  variant="ghost"
                  className="blog-detail-back-button inline-flex items-center gap-2"
                  onClick={() => setSelectedPostId(null)}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver
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
                        {selectedPost.readTimeLabel} lectura
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
                        if (block.type === "heading") {
                          return (
                            <h2
                              key={`${selectedPost.id}-heading-${index}`}
                              className="blog-detail-heading"
                            >
                              {block.value}
                            </h2>
                          );
                        }

                        if (block.type === "quote") {
                          return (
                            <blockquote
                              key={`${selectedPost.id}-quote-${index}`}
                              className="blog-detail-quote"
                            >
                              {block.value}
                            </blockquote>
                          );
                        }

                        if (block.type === "code") {
                          return (
                            <pre
                              key={`${selectedPost.id}-code-${index}`}
                              className="blog-detail-code"
                            >
                              <code>{block.value}</code>
                            </pre>
                          );
                        }

                        if (block.type === "image") {
                          return (
                            <figure
                              key={`${selectedPost.id}-image-${index}`}
                              className="blog-detail-content-figure"
                            >
                              <ImageWithFallback
                                src={block.value}
                                alt={`${selectedPost.title} - imagen ${index + 1}`}
                                className="blog-detail-content-image"
                              />
                            </figure>
                          );
                        }

                        if (block.type === "note" || block.type === "warning") {
                          return (
                            <div
                              key={`${selectedPost.id}-${block.type}-${index}`}
                              className={`blog-detail-callout blog-detail-callout-${block.type}`}
                            >
                              {block.value}
                            </div>
                          );
                        }

                        return (
                          <p
                            key={`${selectedPost.id}-paragraph-${index}`}
                            className="blog-detail-paragraph"
                          >
                            {block.value}
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
                    aria-label="Posts sugeridos y recientes"
                  >
                    <div className="blog-detail-rail-panel">
                      <p className="blog-detail-rail-eyebrow">Sigue leyendo</p>
                      <h3 className="blog-detail-rail-title">
                        Posts sugeridos y recientes
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
                                        ? "Relacionado"
                                        : "Reciente"}
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
