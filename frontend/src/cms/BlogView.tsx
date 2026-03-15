import { ChangeEvent, DragEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  BookText,
  ChevronDown,
  ChevronUp,
  Clock3,
  Eye,
  FileText,
  FolderTree,
  Globe2,
  ImageIcon,
  Pencil,
  Plus,
  Save,
  Search,
  Sparkles,
  Tags,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  createBlogCategoryCms,
  createBlogCms,
  createBlogTagCms,
  deleteBlogCategoryCms,
  deleteBlogCms,
  deleteBlogTagCms,
  getBlogCategoriesCms,
  getBlogsCms,
  getBlogTagsCms,
  updateBlogCms,
  uploadBlogImageCms,
} from "./api";
import { HttpError } from "../api/http";
import type { BlogCategory, BlogPost, BlogPostCreate, BlogStatus, BlogTag } from "./types";

const EMPTY_FORM: BlogPostCreate = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  image: "",
  date: new Date().toISOString().slice(0, 10),
  status: "draft",
  is_featured: false,
  published_at: null,
  read_time_minutes: 1,
  seo_title: "",
  seo_description: "",
  category_id: 0,
  tag_ids: [],
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

type BlockType = "heading" | "paragraph" | "quote" | "code" | "image";

type ContentBlock = {
  id: string;
  type: BlockType;
  value: string;
};

function createBlock(type: BlockType = "paragraph", value = ""): ContentBlock {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    value,
  };
}

function parseBlocks(rawContent?: string | null): ContentBlock[] {
  const input = (rawContent ?? "").trim();
  if (!input) return [createBlock("paragraph")];

  try {
    const parsed = JSON.parse(input);
    if (Array.isArray(parsed)) {
      const normalized = parsed
        .filter((item) => item && typeof item === "object")
        .map((item) => {
          const value = typeof item.value === "string" ? item.value : "";
          const type: BlockType =
            item.type === "heading" || item.type === "quote" || item.type === "code" || item.type === "image"
              ? item.type
              : "paragraph";
          return createBlock(type, value);
        })
        .filter((block) => block.value.trim().length > 0);

      return normalized.length > 0 ? normalized : [createBlock("paragraph")];
    }
  } catch {
    // fallback a contenido plano
  }

  return [createBlock("paragraph", input)];
}

function contentTextFromBlocks(blocks: ContentBlock[]): string {
  return blocks
    .filter((block) => block.type !== "image")
    .map((block) => block.value.trim())
    .filter(Boolean)
    .join(" ");
}

function serializeBlocks(blocks: ContentBlock[]): string {
  const compact = blocks
    .map((block) => ({ type: block.type, value: block.value.trim() }))
    .filter((block) => block.value.length > 0);

  return JSON.stringify(compact.length > 0 ? compact : [{ type: "paragraph", value: "" }]);
}

function estimateReadTimeMinutes(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 180));
}

export function BlogView({
  onBlogsCountChange,
}: {
  onBlogsCountChange: (count: number) => void;
}) {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [form, setForm] = useState<BlogPostCreate>(EMPTY_FORM);
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([createBlock("paragraph")]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [coverDropActive, setCoverDropActive] = useState(false);
  const [activeContentDropBlockId, setActiveContentDropBlockId] = useState<string | null>(null);
  const [pendingCoverFile, setPendingCoverFile] = useState<File | null>(null);
  const [pendingCoverPreviewUrl, setPendingCoverPreviewUrl] = useState<string | null>(null);
  const [pendingContentFiles, setPendingContentFiles] = useState<Record<string, File>>({});
  const [pendingContentPreviewUrls, setPendingContentPreviewUrls] = useState<Record<string, string>>({});

  const autoFillSeo = useCallback(() => {
    setForm((current) => {
      const autoSeoTitle = current.title.trim().slice(0, 60);
      const autoSeoDescription = current.excerpt.trim().slice(0, 160);
      return {
        ...current,
        seo_title: current.seo_title?.trim() ? current.seo_title : autoSeoTitle,
        seo_description: current.seo_description?.trim()
          ? current.seo_description
          : autoSeoDescription,
      };
    });
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [blogsData, categoriesData, tagsData] = await Promise.all([
        getBlogsCms(),
        getBlogCategoriesCms(),
        getBlogTagsCms(),
      ]);
      setBlogs(blogsData);
      setCategories(categoriesData);
      setTags(tagsData);
      onBlogsCountChange(blogsData.length);

      if (!editing && categoriesData.length > 0 && form.category_id === 0) {
        setForm((current) => ({
          ...current,
          category_id: categoriesData[0].id,
        }));
      }
    } catch {
      toast.error("No se pudo cargar el modulo de blog");
    } finally {
      setLoading(false);
    }
  }, [editing, form.category_id, onBlogsCountChange]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return blogs;
    const q = searchTerm.trim().toLowerCase();
    return blogs.filter((post) => {
      const categoryName = post.category?.name ?? "";
      const tagNames = (post.tags ?? []).map((tag) => tag.name).join(" ").toLowerCase();
      return (
        post.title.toLowerCase().includes(q) ||
        post.slug.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        categoryName.toLowerCase().includes(q) ||
        tagNames.includes(q)
      );
    });
  }, [blogs, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const resetForm = () => {
    if (pendingCoverPreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(pendingCoverPreviewUrl);
    }
    Object.values(pendingContentPreviewUrls).forEach((previewUrl) => {
      if (previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    });

    setPendingCoverFile(null);
    setPendingCoverPreviewUrl(null);
    setPendingContentFiles({});
    setPendingContentPreviewUrls({});

    setEditing(null);
    setContentBlocks([createBlock("paragraph")]);
    setForm({
      ...EMPTY_FORM,
      category_id: categories[0]?.id ?? 0,
    });
  };

  const openEdit = (post: BlogPost) => {
    if (pendingCoverPreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(pendingCoverPreviewUrl);
    }
    Object.values(pendingContentPreviewUrls).forEach((previewUrl) => {
      if (previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    });

    setPendingCoverFile(null);
    setPendingCoverPreviewUrl(null);
    setPendingContentFiles({});
    setPendingContentPreviewUrls({});

    setEditing(post);
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content ?? "",
      image: post.image,
      date: post.date,
      status: post.status,
      is_featured: post.is_featured,
      published_at: post.published_at ?? null,
      read_time_minutes: post.read_time_minutes,
      seo_title: post.seo_title ?? "",
      seo_description: post.seo_description ?? "",
      category_id: post.category_id,
      tag_ids: (post.tags ?? []).map((tag) => tag.id),
    });
    setContentBlocks(parseBlocks(post.content));
  };

  const addBlock = (type: BlockType) => {
    setContentBlocks((current) => [...current, createBlock(type)]);
  };

  const updateBlock = (id: string, changes: Partial<ContentBlock>) => {
    setContentBlocks((current) =>
      current.map((block) => (block.id === id ? { ...block, ...changes } : block)),
    );
  };

  const removeBlock = (id: string) => {
    const previewUrl = pendingContentPreviewUrls[id];
    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    setPendingContentFiles((current) => {
      const { [id]: _removed, ...rest } = current;
      return rest;
    });
    setPendingContentPreviewUrls((current) => {
      const { [id]: _removed, ...rest } = current;
      return rest;
    });

    setContentBlocks((current) => {
      const next = current.filter((block) => block.id !== id);
      return next.length > 0 ? next : [createBlock("paragraph")];
    });
  };

  const moveBlock = (id: string, direction: -1 | 1) => {
    setContentBlocks((current) => {
      const index = current.findIndex((block) => block.id === id);
      if (index < 0) return current;
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= current.length) return current;

      const next = [...current];
      const [item] = next.splice(index, 1);
      next.splice(targetIndex, 0, item);
      return next;
    });
  };

  const seoChecks = useMemo(() => {
    const seoTitleLength = (form.seo_title ?? "").trim().length;
    const seoDescriptionLength = (form.seo_description ?? "").trim().length;
    const excerptLength = form.excerpt.trim().length;

    return [
      {
        label: "Slug URL",
        ok: form.slug.trim().length >= 10,
        detail: "Ideal: >= 10 caracteres",
      },
      {
        label: "SEO title",
        ok: seoTitleLength >= 30 && seoTitleLength <= 60,
        detail: `${seoTitleLength}/60 caracteres (ideal 30-60)`,
      },
      {
        label: "SEO description",
        ok: seoDescriptionLength >= 120 && seoDescriptionLength <= 160,
        detail: `${seoDescriptionLength}/160 caracteres (ideal 120-160)`,
      },
      {
        label: "Extracto",
        ok: excerptLength >= 80,
        detail: `${excerptLength} caracteres (ideal >= 80)`,
      },
      {
        label: "Imagen",
        ok: Boolean(form.image.trim()),
        detail: form.image.trim() ? "OK" : "Falta portada",
      },
    ];
  }, [form.excerpt, form.image, form.seo_description, form.seo_title, form.slug]);

  const contentText = useMemo(() => contentTextFromBlocks(contentBlocks), [contentBlocks]);

  const estimatedReadTime = useMemo(
    () => estimateReadTimeMinutes(`${form.title} ${form.excerpt} ${contentText}`),
    [contentText, form.excerpt, form.title],
  );

  const seoCompletedChecks = useMemo(
    () => seoChecks.filter((check) => check.ok).length,
    [seoChecks],
  );

  const selectedTags = useMemo(
    () => tags.filter((tag) => form.tag_ids.includes(tag.id)),
    [form.tag_ids, tags],
  );

  const categoryUsage = useMemo(() => {
    const usage = new Map<number, number>();
    blogs.forEach((post) => {
      usage.set(post.category_id, (usage.get(post.category_id) ?? 0) + 1);
    });
    return usage;
  }, [blogs]);

  const tagUsage = useMemo(() => {
    const usage = new Map<number, number>();
    blogs.forEach((post) => {
      (post.tags ?? []).forEach((tag) => {
        usage.set(tag.id, (usage.get(tag.id) ?? 0) + 1);
      });
    });
    return usage;
  }, [blogs]);

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (!selected) return;

    if (!validateImageFile(selected)) {
      event.target.value = "";
      return;
    }

    if (pendingCoverPreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(pendingCoverPreviewUrl);
    }

    const previewUrl = URL.createObjectURL(selected);
    setPendingCoverFile(selected);
    setPendingCoverPreviewUrl(previewUrl);
    setForm((current) => ({ ...current, image: previewUrl }));
    toast.success("Imagen principal lista. Se subira al guardar.");
    event.target.value = "";
  };

  const validateImageFile = (selected: File): boolean => {
    if (!selected.type.startsWith("image/")) {
      toast.error("Solo se permiten imagenes");
      return false;
    }

    const maxSize = 10 * 1024 * 1024;
    if (selected.size > maxSize) {
      toast.error("La imagen supera el limite de 10 MB");
      return false;
    }

    return true;
  };

  const handleCoverDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setCoverDropActive(false);
    const file = event.dataTransfer.files?.[0];
    if (!file) return;

    if (!validateImageFile(file)) {
      return;
    }

    if (pendingCoverPreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(pendingCoverPreviewUrl);
    }

    const previewUrl = URL.createObjectURL(file);
    setPendingCoverFile(file);
    setPendingCoverPreviewUrl(previewUrl);
    setForm((current) => ({ ...current, image: previewUrl }));
    toast.success("Imagen principal lista. Se subira al guardar.");
  };

  const handleContentImageFileSelected = async (
    event: ChangeEvent<HTMLInputElement>,
    blockId: string,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!validateImageFile(file)) {
      event.target.value = "";
      return;
    }

    const oldPreviewUrl = pendingContentPreviewUrls[blockId];
    if (oldPreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(oldPreviewUrl);
    }

    const previewUrl = URL.createObjectURL(file);
    setPendingContentFiles((current) => ({ ...current, [blockId]: file }));
    setPendingContentPreviewUrls((current) => ({ ...current, [blockId]: previewUrl }));
    updateBlock(blockId, { value: previewUrl, type: "image" });
    toast.success("Imagen de contenido lista. Se subira al guardar.");
    event.target.value = "";
  };

  const handleContentDrop = async (
    event: DragEvent<HTMLDivElement>,
    blockId: string,
  ) => {
    event.preventDefault();
    setActiveContentDropBlockId(null);
    const file = event.dataTransfer.files?.[0];
    if (!file) return;

    if (!validateImageFile(file)) {
      return;
    }

    const oldPreviewUrl = pendingContentPreviewUrls[blockId];
    if (oldPreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(oldPreviewUrl);
    }

    const previewUrl = URL.createObjectURL(file);
    setPendingContentFiles((current) => ({ ...current, [blockId]: file }));
    setPendingContentPreviewUrls((current) => ({ ...current, [blockId]: previewUrl }));
    updateBlock(blockId, { value: previewUrl, type: "image" });
    toast.success("Imagen de contenido lista. Se subira al guardar.");
  };

  const handleCoverUrlChange = (value: string) => {
    if (pendingCoverPreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(pendingCoverPreviewUrl);
    }

    setPendingCoverFile(null);
    setPendingCoverPreviewUrl(null);
    setForm((current) => ({ ...current, image: value }));
  };

  const handleContentImageUrlChange = (blockId: string, value: string) => {
    const oldPreviewUrl = pendingContentPreviewUrls[blockId];
    if (oldPreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(oldPreviewUrl);
    }

    setPendingContentFiles((current) => {
      const { [blockId]: _removed, ...rest } = current;
      return rest;
    });
    setPendingContentPreviewUrls((current) => {
      const { [blockId]: _removed, ...rest } = current;
      return rest;
    });
    updateBlock(blockId, { value, type: "image" });
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.slug.trim() || !form.excerpt.trim() || !form.date || !form.category_id) {
      toast.error("Completa titulo, slug, extracto, fecha y categoria");
      return;
    }

    setSaving(true);
    try {
      let resolvedCoverImage = form.image;
      const resolvedBlocks = contentBlocks.map((block) => ({ ...block }));
      const hasPendingContentImages = Object.keys(pendingContentFiles).length > 0;

      if (pendingCoverFile || hasPendingContentImages) {
        setUploading(true);

        if (pendingCoverFile) {
          const uploadedCover = await uploadBlogImageCms(pendingCoverFile, "cover");
          resolvedCoverImage = uploadedCover.file_url;
        }

        for (const block of resolvedBlocks) {
          if (block.type !== "image") {
            continue;
          }

          const pendingFile = pendingContentFiles[block.id];
          if (!pendingFile) {
            continue;
          }

          const uploadedContentImage = await uploadBlogImageCms(pendingFile, "content");
          block.value = uploadedContentImage.file_url;
        }

        if (pendingCoverPreviewUrl?.startsWith("blob:")) {
          URL.revokeObjectURL(pendingCoverPreviewUrl);
        }
        Object.values(pendingContentPreviewUrls).forEach((previewUrl) => {
          if (previewUrl.startsWith("blob:")) {
            URL.revokeObjectURL(previewUrl);
          }
        });

        setPendingCoverFile(null);
        setPendingCoverPreviewUrl(null);
        setPendingContentFiles({});
        setPendingContentPreviewUrls({});
        setForm((current) => ({ ...current, image: resolvedCoverImage }));
        setContentBlocks(resolvedBlocks);
      }

      const resolvedContentText = contentTextFromBlocks(resolvedBlocks);
      const inferredReadTime = estimateReadTimeMinutes(
        `${form.title} ${form.excerpt} ${resolvedContentText}`,
      );
      const payload: BlogPostCreate = {
        ...form,
        image: resolvedCoverImage,
        content: serializeBlocks(resolvedBlocks),
        read_time_minutes: form.read_time_minutes > 0 ? form.read_time_minutes : inferredReadTime,
        seo_title: (form.seo_title ?? "").trim() || form.title.trim().slice(0, 60),
        seo_description:
          (form.seo_description ?? "").trim() || form.excerpt.trim().slice(0, 160),
      };

      if (editing) {
        const updatePayload = {
          ...payload,
          published_at: payload.published_at || null,
        };
        await updateBlogCms(editing.id, updatePayload);
        toast.success("Post actualizado correctamente");
      } else {
        await createBlogCms(payload);
        toast.success("Post creado correctamente");
      }
      resetForm();
      await load();
    } catch (err) {
      if (err instanceof HttpError && err.status === 422) {
        const details =
          typeof err.data === "object" && err.data !== null && "detail" in err.data
            ? JSON.stringify((err.data as { detail: unknown }).detail)
            : err.message;
        toast.error(`Error de validacion al guardar: ${details}`);
      } else {
        toast.error(err instanceof Error ? err.message : "No se pudo guardar el post");
      }
    } finally {
      setUploading(false);
      setSaving(false);
    }
  };

  const handleDeleteBlog = async (post: BlogPost) => {
    if (!window.confirm(`Se eliminara "${post.title}". Esta accion no se puede deshacer.`)) {
      return;
    }

    try {
      await deleteBlogCms(post.id);
      toast.success("Post eliminado");
      if (editing?.id === post.id) {
        resetForm();
      }
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo eliminar el post");
    }
  };

  const handleCreateCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) {
      toast.error("Escribe un nombre para la categoria");
      return;
    }

    try {
      const created = await createBlogCategoryCms({ name });
      setCategories((current) => [...current, created]);
      setNewCategoryName("");
      setForm((current) => ({ ...current, category_id: created.id }));
      toast.success("Categoria creada");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo crear la categoria");
    }
  };

  const handleDeleteCategory = async (category: BlogCategory) => {
    const inUse = blogs.some((post) => post.category_id === category.id);
    if (inUse) {
      toast.error("No puedes eliminar una categoria en uso");
      return;
    }

    if (!window.confirm(`Eliminar categoria "${category.name}"?`)) {
      return;
    }

    try {
      await deleteBlogCategoryCms(category.id);
      const next = categories.filter((item) => item.id !== category.id);
      setCategories(next);
      if (form.category_id === category.id) {
        setForm((current) => ({ ...current, category_id: next[0]?.id ?? 0 }));
      }
      toast.success("Categoria eliminada");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo eliminar la categoria");
    }
  };

  const handleCreateTag = async () => {
    const name = newTagName.trim();
    if (!name) {
      toast.error("Escribe un nombre para el tag");
      return;
    }

    try {
      const created = await createBlogTagCms({ name, slug: slugify(name) });
      setTags((current) => [...current, created]);
      setNewTagName("");
      setForm((current) => ({ ...current, tag_ids: [...current.tag_ids, created.id] }));
      toast.success("Tag creado");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo crear el tag");
    }
  };

  const handleDeleteTag = async (tag: BlogTag) => {
    const inUse = blogs.some((post) => (post.tags ?? []).some((postTag) => postTag.id === tag.id));
    if (inUse) {
      toast.error("No puedes eliminar un tag en uso");
      return;
    }

    if (!window.confirm(`Eliminar tag "${tag.name}"?`)) {
      return;
    }

    try {
      await deleteBlogTagCms(tag.id);
      setTags((current) => current.filter((item) => item.id !== tag.id));
      setForm((current) => ({
        ...current,
        tag_ids: current.tag_ids.filter((tagId) => tagId !== tag.id),
      }));
      toast.success("Tag eliminado");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo eliminar el tag");
    }
  };

  const statusLabel: Record<BlogStatus, string> = {
    draft: "Borrador",
    published: "Publicado",
    scheduled: "Programado",
    archived: "Archivado",
  };

  return (
    <div className="cms-blog-shell space-y-4">
      <div className="cms-stats-grid">
        {[
          { label: "Total posts", value: String(blogs.length), icon: BookText },
          { label: "Categorias", value: String(categories.length), icon: FolderTree },
          { label: "Tags", value: String(tags.length), icon: Tags },
          {
            label: "Publicados",
            value: String(blogs.filter((post) => post.status === "published").length),
            icon: Activity,
          },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label} className="cms-stat-card">
            <CardContent className="flex items-start justify-between p-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-zinc-500">{label}</p>
                <p className="mt-2 text-2xl font-semibold text-zinc-100">{value}</p>
              </div>
              <div className="cms-stat-icon">
                <Icon className="h-4 w-4 text-emerald-400" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <Card className="cms-panel-card cms-blog-list-card overflow-hidden">
          <CardHeader className="cms-blog-card-header border-b border-zinc-800">
            <div className="cms-blog-card-heading">
              <div>
                <CardTitle className="text-sm font-medium text-zinc-100">Posts ({filtered.length})</CardTitle>
                <CardDescription className="mt-1 text-xs text-zinc-500">
                  Biblioteca editorial con estados, categorias y etiquetas.
                </CardDescription>
              </div>
              <div className="cms-blog-header-kicker">
                <span className="cms-chip">{blogs.filter((post) => post.status === "published").length} publicados</span>
              </div>
            </div>
            <div className="cms-search-wrap cms-blog-search-wrap">
              <Search className="cms-search-icon" aria-hidden="true" />
              <Input
                className="cms-input cms-search-input h-9 text-sm"
                placeholder="Buscar por titulo, slug, categoria o tags..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-sm text-zinc-500">Cargando posts...</div>
            ) : filtered.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-sm text-zinc-500">
                {searchTerm ? "No se encontraron resultados para tu busqueda" : "Aun no hay posts. Crea el primero."}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="cms-table-head">
                    <tr>
                      <th className="font-medium">Titulo</th>
                      <th className="hidden font-medium sm:table-cell">Estado</th>
                      <th className="hidden font-medium md:table-cell">Categoria</th>
                      <th className="font-medium">Fecha</th>
                      <th className="text-right font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((post) => (
                      <tr key={post.id} className="cms-table-row">
                        <td className="max-w-[280px] text-left" title={post.title}>
                          <div className="cms-post-row-main">
                            <div className="cms-post-row-title-wrap">
                              <span className="cms-post-row-title">{post.title}</span>
                              {post.is_featured ? <Badge className="cms-chip">Destacado</Badge> : null}
                            </div>
                            <span className="cms-post-row-slug">/{post.slug}</span>
                          </div>
                        </td>
                        <td className="hidden sm:table-cell">
                          <Badge className={post.status === "published" ? "cms-chip" : "cms-chip-draft"}>
                            {statusLabel[post.status]}
                          </Badge>
                        </td>
                        <td className="hidden md:table-cell text-zinc-300">{post.category?.name ?? "Sin categoria"}</td>
                        <td className="text-zinc-400">{post.date}</td>
                        <td className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="cms-outline-btn h-7 w-7 p-0"
                              title="Editar"
                              onClick={() => openEdit(post)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="cms-outline-btn cms-outline-btn-danger h-7 w-7 p-0"
                              title="Eliminar"
                              onClick={() => void handleDeleteBlog(post)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && filtered.length > 0 && (
              <div className="cms-table-footer">
                <span>
                  Mostrando {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} de {filtered.length} registros
                </span>
                <div className="flex items-center gap-1">
                  <span className="mr-1 text-zinc-600">Pag. {page}/{totalPages}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="cms-outline-btn h-7 px-2 text-xs"
                    disabled={page <= 1}
                    onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                  >
                    Anterior
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="cms-outline-btn h-7 px-2 text-xs"
                    disabled={page >= totalPages}
                    onClick={() => setPage((currentPage) => Math.min(totalPages, currentPage + 1))}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="cms-panel-card cms-editor-card">
            <CardHeader className="cms-blog-card-header pb-3">
              <div className="cms-blog-card-heading">
                <div>
                  <CardTitle className="text-sm font-medium text-zinc-100">{editing ? "Editar post" : "Nuevo post"}</CardTitle>
                  <CardDescription className="mt-1 text-xs text-zinc-500">
                    {editing ? `Modificando: ${editing.title}` : "Panel editorial para redactar, clasificar y optimizar el contenido."}
                  </CardDescription>
                </div>
                <div className="cms-editor-status-group">
                  <Badge className={form.status === "published" ? "cms-chip" : "cms-chip-draft"}>
                    {statusLabel[form.status]}
                  </Badge>
                  {saving ? <span className="cms-editor-status-pill">Guardando...</span> : null}
                  {uploading ? <span className="cms-editor-status-pill">Subiendo imagen...</span> : null}
                </div>
              </div>
            </CardHeader>
            <CardContent className="cms-editor-content space-y-4">
              <section className="cms-editor-section">
                <div className="cms-editor-section-header">
                  <div className="cms-editor-section-heading">
                    <div className="cms-editor-section-icon">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="cms-editor-section-title">Informacion del articulo</h3>
                      <p className="cms-editor-section-copy">Define el contenido base y la URL del post.</p>
                    </div>
                  </div>
                </div>

                <div className="cms-editor-field-group">
                  <div className="cms-field-stack">
                    <Label className="cms-field-label">Titulo *</Label>
                    <Input
                      className="cms-input h-10 text-sm"
                      value={form.title}
                      onChange={(event) => {
                        const title = event.target.value;
                        setForm((current) => ({
                          ...current,
                          title,
                          slug: editing ? current.slug : slugify(title),
                        }));
                      }}
                      placeholder="Ej. Arquitectura limpia para APIs"
                    />
                  </div>

                  <div className="cms-editor-grid cms-editor-grid-2">
                    <div className="cms-field-stack">
                      <Label className="cms-field-label">Slug *</Label>
                      <Input
                        className="cms-input h-10 text-sm"
                        value={form.slug}
                        onChange={(event) => setForm((current) => ({ ...current, slug: slugify(event.target.value) }))}
                        placeholder="arquitectura-limpia-apis"
                      />
                      <p className="cms-field-helper">Se usa en la URL publica del articulo.</p>
                    </div>
                    <div className="cms-field-stack">
                      <Label className="cms-field-label">Estado</Label>
                      <select
                        className="cms-input h-10 w-full px-3 text-sm"
                        value={form.status}
                        onChange={(event) =>
                          setForm((current) => ({ ...current, status: event.target.value as BlogStatus }))
                        }
                      >
                        <option value="draft">Borrador</option>
                        <option value="published">Publicado</option>
                        <option value="scheduled">Programado</option>
                        <option value="archived">Archivado</option>
                      </select>
                    </div>
                  </div>

                  <div className="cms-field-stack">
                    <Label className="cms-field-label">Extracto *</Label>
                    <Textarea
                      className="cms-input min-h-28 text-sm"
                      value={form.excerpt}
                      onChange={(event) => setForm((current) => ({ ...current, excerpt: event.target.value }))}
                      placeholder="Resumen breve para cards, listados y SEO..."
                    />
                    <p className="cms-field-helper">Resume el angulo principal del post en pocas lineas.</p>
                  </div>
                </div>
              </section>

              <section className="cms-editor-section">
                <div className="cms-editor-section-header">
                  <div className="cms-editor-section-heading">
                    <div className="cms-editor-section-icon">
                      <Clock3 className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="cms-editor-section-title">Metadatos editoriales</h3>
                      <p className="cms-editor-section-copy">Contexto, clasificacion y visibilidad del contenido.</p>
                    </div>
                  </div>
                  <div className="cms-editor-inline-note">Lectura estimada: {estimatedReadTime} min</div>
                </div>

                <div className="cms-editor-grid cms-editor-grid-2">
                  <div className="cms-field-stack">
                    <Label className="cms-field-label">Fecha</Label>
                    <Input
                      type="date"
                      className="cms-input h-10 text-sm"
                      value={form.date}
                      onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
                    />
                  </div>
                  <div className="cms-field-stack">
                    <Label className="cms-field-label">Minutos lectura</Label>
                    <Input
                      type="number"
                      min={1}
                      className="cms-input h-10 text-sm"
                      value={form.read_time_minutes}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, read_time_minutes: Math.max(1, Number(event.target.value) || 1) }))
                      }
                    />
                  </div>
                  <div className="cms-field-stack">
                    <Label className="cms-field-label">Categoria *</Label>
                    <select
                      className="cms-input h-10 w-full px-3 text-sm"
                      value={form.category_id || ""}
                      onChange={(event) => setForm((current) => ({ ...current, category_id: Number(event.target.value) }))}
                    >
                      {categories.length === 0 ? (
                        <option value="">Sin categorias</option>
                      ) : (
                        categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                  <div className="cms-field-stack">
                    <Label className="cms-field-label">Visibilidad</Label>
                    <label htmlFor="post-featured" className="cms-toggle-card">
                      <div>
                        <span className="cms-toggle-card-title">Post destacado</span>
                        <p className="cms-toggle-card-copy">Se prioriza en el blog publico.</p>
                      </div>
                      <input
                        id="post-featured"
                        type="checkbox"
                        className="h-4 w-4 rounded border-zinc-600 accent-emerald-500"
                        checked={form.is_featured}
                        onChange={(event) => setForm((current) => ({ ...current, is_featured: event.target.checked }))}
                      />
                    </label>
                  </div>
                </div>
              </section>

              <section className="cms-editor-section">
                <div className="cms-editor-section-header">
                  <div className="cms-editor-section-heading">
                    <div className="cms-editor-section-icon">
                      <Tags className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="cms-editor-section-title">Tags</h3>
                      <p className="cms-editor-section-copy">Selecciona etiquetas para mejorar organizacion y descubrimiento.</p>
                    </div>
                  </div>
                  <div className="cms-editor-inline-note">{selectedTags.length} seleccionados</div>
                </div>

                {tags.length === 0 ? (
                  <p className="cms-empty-copy">No hay tags creados.</p>
                ) : (
                  <div className="cms-tag-selector-panel">
                    <div className="cms-selected-tags-row">
                      {selectedTags.length > 0 ? (
                        selectedTags.map((tag) => (
                          <button
                            key={tag.id}
                            type="button"
                            className="cms-tag-selected-chip"
                            onClick={() =>
                              setForm((current) => ({
                                ...current,
                                tag_ids: current.tag_ids.filter((tagId) => tagId !== tag.id),
                              }))
                            }
                          >
                            <span>{tag.name}</span>
                            <X className="h-3.5 w-3.5" />
                          </button>
                        ))
                      ) : (
                        <span className="cms-empty-copy">Todavia no has seleccionado tags para este post.</span>
                      )}
                    </div>

                    <div className="cms-tag-pool">
                      {tags.map((tag) => {
                        const selected = form.tag_ids.includes(tag.id);
                        return (
                          <button
                            key={tag.id}
                            type="button"
                            aria-pressed={selected}
                            className={selected ? "cms-tag-toggle cms-tag-toggle-active" : "cms-tag-toggle"}
                            onClick={() => {
                              setForm((current) => ({
                                ...current,
                                tag_ids: selected
                                  ? current.tag_ids.filter((tagId) => tagId !== tag.id)
                                  : [...current.tag_ids, tag.id],
                              }));
                            }}
                          >
                            <span>{tag.name}</span>
                            <span className="cms-tag-toggle-meta">{tagUsage.get(tag.id) ?? 0}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </section>

              <section className="cms-editor-section">
                <div className="cms-editor-section-header">
                  <div className="cms-editor-section-heading">
                    <div className="cms-editor-section-icon">
                      <ImageIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="cms-editor-section-title">Media</h3>
                      <p className="cms-editor-section-copy">Define una portada visual coherente para el articulo.</p>
                    </div>
                  </div>
                </div>

                <div className="cms-editor-media-grid">
                  <div className="cms-media-preview-card">
                    {form.image.trim() ? (
                      <img src={form.image} alt={form.title || "Preview portada"} className="cms-media-preview-image" />
                    ) : (
                      <div className="cms-media-preview-placeholder">
                        <ImageIcon className="h-6 w-6" />
                        <span>Sin portada seleccionada</span>
                      </div>
                    )}
                  </div>
                  <div className="cms-editor-field-group">
                    <div className="cms-field-stack">
                      <Label className="cms-field-label">Imagen</Label>
                      <Input
                        className="cms-input h-10 text-sm"
                        value={form.image}
                        onChange={(event) => handleCoverUrlChange(event.target.value)}
                        placeholder="URL de portada"
                      />
                    </div>
                    <div className="cms-field-stack">
                      <Label className="cms-field-label">Subida de archivo</Label>
                      <div
                        className={coverDropActive ? "cms-upload-dropzone cms-upload-dropzone-active" : "cms-upload-dropzone"}
                        onDragOver={(event) => {
                          event.preventDefault();
                          setCoverDropActive(true);
                        }}
                        onDragLeave={() => setCoverDropActive(false)}
                        onDrop={(event) => void handleCoverDrop(event)}
                      >
                        <span className="text-xs text-zinc-300">Suelta una imagen de portada aqui</span>
                        <span className="text-[11px] text-zinc-500">o selecciona una desde tu dispositivo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="cms-input cms-file-input h-10 w-full px-3 py-1.5 text-sm"
                          onChange={(event) => void handleImageUpload(event)}
                          disabled={uploading || saving}
                        />
                      </div>
                    </div>
                    <p className="cms-field-helper">
                      {uploading ? "Subiendo imagenes pendientes..." : "Puedes pegar una URL o subir una imagen desde tu equipo. Se sube al guardar."}
                    </p>
                  </div>
                </div>
              </section>

              <section className="cms-editor-section">
                <div className="cms-editor-section-header">
                  <div className="cms-editor-section-heading">
                    <div className="cms-editor-section-icon">
                      <BookText className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="cms-editor-section-title">Contenido del articulo</h3>
                      <p className="cms-editor-section-copy">Construye el post por bloques para ordenar mejor la lectura.</p>
                    </div>
                  </div>
                </div>

                <div className="cms-content-builder">
                  <div className="cms-content-toolbar">
                    <Button
                      type="button"
                      variant="outline"
                      className="cms-outline-btn h-8 px-3 text-xs"
                      onClick={() => addBlock("heading")}
                    >
                      + Titulo
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="cms-outline-btn h-8 px-3 text-xs"
                      onClick={() => addBlock("paragraph")}
                    >
                      + Parrafo
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="cms-outline-btn h-8 px-3 text-xs"
                      onClick={() => addBlock("quote")}
                    >
                      + Cita
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="cms-outline-btn h-8 px-3 text-xs"
                      onClick={() => addBlock("code")}
                    >
                      + Codigo
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="cms-outline-btn h-8 px-3 text-xs"
                      onClick={() => addBlock("image")}
                    >
                      + Imagen
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {contentBlocks.map((block, index) => (
                      <div key={block.id} className="cms-content-block-card">
                        <div className="cms-content-block-header">
                          <div className="cms-content-block-meta">
                            <select
                              className="cms-input h-9 rounded-md px-3 text-xs"
                              value={block.type}
                              onChange={(event) =>
                                updateBlock(block.id, {
                                  type: event.target.value as BlockType,
                                })
                              }
                            >
                              <option value="heading">Titulo</option>
                              <option value="paragraph">Parrafo</option>
                              <option value="quote">Cita</option>
                              <option value="code">Codigo</option>
                              <option value="image">Imagen</option>
                            </select>
                            <span className="cms-content-block-label">Bloque {index + 1}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="cms-outline-btn h-8 w-8 p-0"
                              onClick={() => moveBlock(block.id, -1)}
                              disabled={index === 0}
                              title="Subir"
                            >
                              <ChevronUp className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="cms-outline-btn h-8 w-8 p-0"
                              onClick={() => moveBlock(block.id, 1)}
                              disabled={index === contentBlocks.length - 1}
                              title="Bajar"
                            >
                              <ChevronDown className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="cms-outline-btn cms-outline-btn-danger h-8 w-8 p-0"
                              onClick={() => removeBlock(block.id)}
                              title="Eliminar bloque"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                        {block.type === "image" ? (
                          <div className="space-y-2">
                            {block.value.trim() ? (
                              <img
                                src={block.value}
                                alt={`Bloque imagen ${index + 1}`}
                                className="w-full max-h-52 rounded-md border border-zinc-800 object-cover"
                              />
                            ) : null}
                            <Input
                              className="cms-input h-10 text-sm"
                              value={block.value}
                              onChange={(event) => handleContentImageUrlChange(block.id, event.target.value)}
                              placeholder="URL de imagen del contenido"
                            />
                            <div
                              className={activeContentDropBlockId === block.id ? "cms-upload-dropzone cms-upload-dropzone-active" : "cms-upload-dropzone"}
                              onDragOver={(event) => {
                                event.preventDefault();
                                setActiveContentDropBlockId(block.id);
                              }}
                              onDragLeave={() => setActiveContentDropBlockId(null)}
                              onDrop={(event) => void handleContentDrop(event, block.id)}
                            >
                              <span className="text-xs text-zinc-300">Suelta imagen de contenido aqui (se redimensiona automaticamente)</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="cms-input cms-file-input h-10 w-full px-3 py-1.5 text-sm"
                                onChange={(event) => void handleContentImageFileSelected(event, block.id)}
                                disabled={uploading || saving}
                              />
                            </div>
                          </div>
                        ) : (
                          <Textarea
                            className="cms-input min-h-28 text-sm"
                            value={block.value}
                            onChange={(event) => updateBlock(block.id, { value: event.target.value })}
                            placeholder="Escribe el contenido del bloque..."
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="cms-editor-section">
                <div className="cms-editor-section-header">
                  <div className="cms-editor-section-heading">
                    <div className="cms-editor-section-icon">
                      <Globe2 className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="cms-editor-section-title">SEO</h3>
                      <p className="cms-editor-section-copy">Ajusta metadatos y revisa el estado SEO del articulo.</p>
                    </div>
                  </div>
                  <div className="cms-seo-summary-pill">{seoCompletedChecks}/{seoChecks.length} checks OK</div>
                </div>

                <div className="cms-editor-field-group">
                  <div className="cms-field-stack">
                    <Label className="cms-field-label">SEO title</Label>
                    <Input
                      className="cms-input h-10 text-sm"
                      value={form.seo_title ?? ""}
                      onChange={(event) => setForm((current) => ({ ...current, seo_title: event.target.value }))}
                      placeholder="Titulo SEO (opcional)"
                    />
                  </div>

                  <div className="cms-field-stack">
                    <Label className="cms-field-label">SEO description</Label>
                    <Textarea
                      className="cms-input min-h-24 text-sm"
                      value={form.seo_description ?? ""}
                      onChange={(event) => setForm((current) => ({ ...current, seo_description: event.target.value }))}
                      placeholder="Descripcion SEO (opcional)"
                    />
                  </div>
                </div>

                <div className="cms-seo-panel">
                  <div className="cms-seo-panel-header">
                    <div className="cms-editor-section-heading">
                      <div className="cms-editor-section-icon">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="cms-editor-section-title">Validacion SEO automatica</h4>
                        <p className="cms-editor-section-copy">Indicadores rapidos para decidir si el post esta listo para publicar.</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="cms-outline-btn h-8 px-3 text-xs"
                      onClick={autoFillSeo}
                    >
                      Sugerir SEO
                    </Button>
                  </div>
                  <div className="cms-seo-check-list">
                    {seoChecks.map((check) => (
                      <div key={check.label} className="cms-seo-check-row">
                        <div>
                          <p className="cms-seo-check-title">{check.label}</p>
                          <p className="cms-seo-check-detail">{check.detail}</p>
                        </div>
                        <Badge className={check.ok ? "cms-chip" : "cms-chip-draft"}>
                          {check.ok ? "OK" : "Revisar"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="cms-editor-section">
                <div className="cms-editor-section-header">
                  <div className="cms-editor-section-heading">
                    <div className="cms-editor-section-icon">
                      <Eye className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="cms-editor-section-title">Preview</h3>
                      <p className="cms-editor-section-copy">Vista previa con una composicion mas cercana al articulo final.</p>
                    </div>
                  </div>
                </div>

                <div className="cms-preview-shell">
                  <div className="cms-preview-reading-surface">
                    <p className="cms-preview-slug">/{form.slug || "slug-del-post"}</p>
                    <h3 className="cms-preview-title">{form.title || "Titulo del post"}</h3>
                    <div className="cms-preview-meta">
                      <span>{form.date || "Fecha"}</span>
                      <span>•</span>
                      <span>{form.read_time_minutes || estimatedReadTime} min lectura</span>
                      <span>•</span>
                      <span>{categories.find((category) => category.id === form.category_id)?.name ?? "Sin categoria"}</span>
                    </div>
                    {form.image.trim() ? (
                      <img src={form.image} alt={form.title || "Preview portada"} className="cms-preview-image" />
                    ) : null}
                    <p className="cms-preview-excerpt">{form.excerpt || "Extracto del post"}</p>
                    <div className="cms-preview-content">
                      {contentBlocks
                        .filter((block) => block.value.trim().length > 0)
                        .map((block) => {
                          if (block.type === "heading") {
                            return (
                              <h4 key={block.id} className="cms-preview-heading">
                                {block.value}
                              </h4>
                            );
                          }
                          if (block.type === "quote") {
                            return (
                              <blockquote key={block.id} className="cms-preview-quote">
                                {block.value}
                              </blockquote>
                            );
                          }
                          if (block.type === "code") {
                            return (
                              <pre key={block.id} className="cms-preview-code">
                                {block.value}
                              </pre>
                            );
                          }
                          if (block.type === "image") {
                            return (
                              <img
                                key={block.id}
                                src={block.value}
                                alt="Imagen de contenido"
                                className="w-full rounded-md border border-zinc-800 object-cover"
                              />
                            );
                          }
                          return (
                            <p key={block.id} className="cms-preview-paragraph">
                              {block.value}
                            </p>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </section>

              <div className="cms-editor-actions">
                <div className="cms-editor-actions-copy">
                  <p className="cms-editor-actions-title">Listo para guardar</p>
                  <p className="cms-editor-actions-text">
                    Revisa los campos obligatorios, el SEO y la clasificacion antes de publicar.
                  </p>
                </div>
                <div className="cms-editor-actions-buttons">
                <Button
                  type="button"
                  className="cms-primary-btn h-10 flex-1 text-sm"
                  onClick={() => void handleSave()}
                  disabled={saving || uploading || categories.length === 0}
                >
                  {saving ? (
                    "Guardando..."
                  ) : editing ? (
                    <>
                      <Save className="mr-2 h-3.5 w-3.5" /> Guardar cambios
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-3.5 w-3.5" /> Crear post
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="cms-outline-btn h-10 text-sm"
                  onClick={resetForm}
                  disabled={saving || uploading}
                >
                  Limpiar
                </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cms-panel-card cms-manager-card">
            <CardHeader className="cms-blog-card-header pb-3">
              <div className="cms-blog-card-heading">
                <div>
                  <CardTitle className="text-sm font-medium text-zinc-100">Categorias</CardTitle>
                  <CardDescription className="mt-1 text-xs text-zinc-500">Crea y administra categorias.</CardDescription>
                </div>
                <span className="cms-chip-draft">{categories.length} items</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="cms-manager-input-row">
                <Input
                  className="cms-input h-10 text-sm"
                  value={newCategoryName}
                  onChange={(event) => setNewCategoryName(event.target.value)}
                  placeholder="Nueva categoria"
                />
                <Button type="button" className="cms-primary-btn h-10 px-4 text-xs" onClick={() => void handleCreateCategory()}>
                  <Upload className="mr-1.5 h-3.5 w-3.5" /> Crear
                </Button>
              </div>

              <div className="cms-manager-list">
                {categories.length === 0 ? (
                  <p className="cms-empty-copy">No hay categorias creadas.</p>
                ) : (
                  categories.map((category) => (
                    <div
                      key={category.id}
                      className="cms-manager-item"
                    >
                      <div className="cms-manager-item-main">
                        <span className="cms-manager-item-title">{category.name}</span>
                        <span className="cms-manager-item-meta">{categoryUsage.get(category.id) ?? 0} posts</span>
                      </div>
                      <div className="cms-manager-item-actions">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="cms-outline-btn cms-outline-btn-danger h-8 w-8 p-0"
                          title="Eliminar categoria"
                          onClick={() => void handleDeleteCategory(category)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="cms-panel-card cms-manager-card">
            <CardHeader className="cms-blog-card-header pb-3">
              <div className="cms-blog-card-heading">
                <div>
                  <CardTitle className="text-sm font-medium text-zinc-100">Tags</CardTitle>
                  <CardDescription className="mt-1 text-xs text-zinc-500">Gestiona etiquetas reutilizables.</CardDescription>
                </div>
                <span className="cms-chip-draft">{tags.length} items</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="cms-manager-input-row">
                <Input
                  className="cms-input h-10 text-sm"
                  value={newTagName}
                  onChange={(event) => setNewTagName(event.target.value)}
                  placeholder="Nuevo tag"
                />
                <Button type="button" className="cms-primary-btn h-10 px-4 text-xs" onClick={() => void handleCreateTag()}>
                  <Upload className="mr-1.5 h-3.5 w-3.5" /> Crear
                </Button>
              </div>

              <div className="cms-manager-list">
                {tags.length === 0 ? (
                  <p className="cms-empty-copy">No hay tags creados.</p>
                ) : (
                  tags.map((tag) => (
                    <div
                      key={tag.id}
                      className="cms-manager-item"
                    >
                      <div className="cms-manager-item-main min-w-0">
                        <div>
                          <p className="truncate text-sm text-zinc-300">{tag.name}</p>
                          <p className="truncate text-xs text-zinc-500">{tag.slug}</p>
                        </div>
                        <span className="cms-manager-item-meta">{tagUsage.get(tag.id) ?? 0} usos</span>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="cms-outline-btn cms-outline-btn-danger h-8 w-8 p-0"
                        title="Eliminar tag"
                        onClick={() => void handleDeleteTag(tag)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
