import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { LifeBuoy, Pencil, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";

import { createFaqCms, deleteFaqCms, getFaqCms, updateFaqCms } from "./api";
import type { FrequentlyAskedQuestion } from "./types";

const PAGE_SIZE = 6;

export function FaqView({
  onFaqCountChange,
}: {
  onFaqCountChange: (count: number) => void;
}) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [faqItems, setFaqItems] = useState<FrequentlyAskedQuestion[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  const [editing, setEditing] = useState<FrequentlyAskedQuestion | null>(null);
  const [question, setQuestion] = useState("");
  const [questionEn, setQuestionEn] = useState("");
  const [answer, setAnswer] = useState("");
  const [answerEn, setAnswerEn] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getFaqCms();
      setFaqItems(data);
      onFaqCountChange(data.length);
    } catch {
      toast.error("No se pudo cargar FAQ");
    } finally {
      setLoading(false);
    }
  }, [onFaqCountChange]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return faqItems;
    return faqItems.filter(
      (item) =>
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q),
    );
  }, [faqItems, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const visible = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedQuestion = question.trim();
    const normalizedAnswer = answer.trim();

    if (!normalizedQuestion || !normalizedAnswer) {
      toast.error("Pregunta y respuesta son obligatorias");
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await updateFaqCms(editing.id, {
          question: normalizedQuestion,
          question_en: questionEn.trim() || null,
          answer: normalizedAnswer,
          answer_en: answerEn.trim() || null,
        });
        toast.success("FAQ actualizada");
      } else {
        await createFaqCms({
          question: normalizedQuestion,
          question_en: questionEn.trim() || null,
          answer: normalizedAnswer,
          answer_en: answerEn.trim() || null,
        });
        toast.success("FAQ creada");
      }

      setEditing(null);
      setQuestion("");
      setQuestionEn("");
      setAnswer("");
      setAnswerEn("");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo guardar FAQ");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: FrequentlyAskedQuestion) => {
    setEditing(item);
    setQuestion(item.question);
    setQuestionEn(item.question_en ?? "");
    setAnswer(item.answer);
    setAnswerEn(item.answer_en ?? "");
  };

  const handleDelete = async (item: FrequentlyAskedQuestion) => {
    const shouldDelete = window.confirm(
      `Se eliminara la pregunta "${item.question}". Deseas continuar?`,
    );
    if (!shouldDelete) return;

    setDeletingId(item.id);
    try {
      await deleteFaqCms(item.id);
      toast.success("FAQ eliminada");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo eliminar FAQ");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="cms-panel-card">
        <CardHeader className="border-b border-zinc-800 px-5 py-4">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-zinc-100">
            <LifeBuoy className="h-4 w-4" /> FAQ ({filtered.length})
          </CardTitle>
          <CardDescription className="mt-0.5 text-xs text-zinc-500">
            CRUD real de preguntas frecuentes para el portafolio.
          </CardDescription>

          <form className="mt-3 space-y-2" onSubmit={handleSubmit}>
            <Input
              className="cms-input h-9 text-sm"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Pregunta"
            />
            <Input
              className="cms-input h-9 text-sm"
              value={questionEn}
              onChange={(event) => setQuestionEn(event.target.value)}
              placeholder="Question (English)"
            />
            <Textarea
              className="cms-input min-h-[90px] text-sm"
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              placeholder="Respuesta"
            />
            <Textarea
              className="cms-input min-h-[90px] text-sm"
              value={answerEn}
              onChange={(event) => setAnswerEn(event.target.value)}
              placeholder="Answer (English)"
            />
            <div className="flex gap-2">
              <Button
                type="submit"
                className="cms-primary-btn h-9 text-sm"
                disabled={saving}
              >
                {saving
                  ? "Guardando..."
                  : editing
                    ? "Actualizar"
                    : "Crear"}
              </Button>
              {editing && (
                <Button
                  type="button"
                  variant="outline"
                  className="cms-outline-btn h-9 text-sm"
                  onClick={() => {
                    setEditing(null);
                    setQuestion("");
                    setQuestionEn("");
                    setAnswer("");
                    setAnswerEn("");
                  }}
                >
                  Cancelar
                </Button>
              )}
            </div>
          </form>

          <div className="mt-3 cms-search-wrap">
            <Search className="cms-search-icon" aria-hidden="true" />
            <Input
              className="cms-input cms-search-input h-8 text-sm"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar preguntas y respuestas..."
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-sm text-zinc-500">
              Cargando FAQ...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-sm text-zinc-500">
              {searchTerm
                ? "Sin resultados para la busqueda."
                : "No hay preguntas frecuentes registradas aun."}
            </div>
          ) : (
            <div className="space-y-2 px-4 py-4">
              {visible.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-100">{item.question}</p>
                      <p className="mt-1 text-xs leading-relaxed text-zinc-400">{item.answer}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="cms-outline-btn h-7 w-7 p-0"
                        onClick={() => handleEdit(item)}
                        title="Editar"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="cms-outline-btn cms-outline-btn-danger h-7 w-7 p-0"
                        onClick={() => void handleDelete(item)}
                        disabled={deletingId === item.id}
                        title="Eliminar"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <div className="cms-table-footer">
              <span>
                Mostrando {(page - 1) * PAGE_SIZE + 1}-
                {Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length} registros
              </span>
              <div className="flex items-center gap-1">
                <span className="mr-1 text-zinc-600">
                  Pag. {page}/{totalPages}
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="cms-outline-btn h-7 px-2 text-xs"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  Anterior
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="cms-outline-btn h-7 px-2 text-xs"
                  disabled={page >= totalPages}
                  onClick={() =>
                    setPage((current) => Math.min(totalPages, current + 1))
                  }
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
