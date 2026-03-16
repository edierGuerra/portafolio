import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Pencil, Search, Trash2, Wrench } from "lucide-react";
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

import {
  createServiceCms,
  deleteServiceCms,
  getServicesCms,
  updateServiceCms,
} from "./api";
import type { AvailableService } from "./types";

const PAGE_SIZE = 8;

export function ServicesView({
  onServicesCountChange,
}: {
  onServicesCountChange: (count: number) => void;
}) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [services, setServices] = useState<AvailableService[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  const [editing, setEditing] = useState<AvailableService | null>(null);
  const [serviceValue, setServiceValue] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getServicesCms();
      setServices(data);
      onServicesCountChange(data.length);
    } catch {
      toast.error("No se pudieron cargar los servicios");
    } finally {
      setLoading(false);
    }
  }, [onServicesCountChange]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return services;
    return services.filter((item) => item.service.toLowerCase().includes(q));
  }, [services, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const visible = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = serviceValue.trim();
    if (!trimmed) {
      toast.error("Escribe el nombre del servicio");
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await updateServiceCms(editing.id, { service: trimmed });
        toast.success("Servicio actualizado");
      } else {
        await createServiceCms({ service: trimmed });
        toast.success("Servicio creado");
      }

      setEditing(null);
      setServiceValue("");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: AvailableService) => {
    setEditing(item);
    setServiceValue(item.service);
  };

  const handleDelete = async (item: AvailableService) => {
    const shouldDelete = window.confirm(
      `Se eliminara el servicio "${item.service}". Deseas continuar?`,
    );
    if (!shouldDelete) return;

    setDeletingId(item.id);
    try {
      await deleteServiceCms(item.id);
      toast.success("Servicio eliminado");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo eliminar");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="cms-panel-card">
        <CardHeader className="border-b border-zinc-800 px-5 py-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-zinc-100">
                <Wrench className="h-4 w-4" /> Servicios ({filtered.length})
              </CardTitle>
              <CardDescription className="mt-0.5 text-xs text-zinc-500">
                CRUD real de servicios que se muestran en el portafolio.
              </CardDescription>
            </div>
          </div>

          <form className="mt-3 flex flex-col gap-2 sm:flex-row" onSubmit={handleSubmit}>
            <Input
              className="cms-input h-9 text-sm"
              value={serviceValue}
              onChange={(event) => setServiceValue(event.target.value)}
              placeholder="Ej. Desarrollo de aplicaciones web"
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
                    setServiceValue("");
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
              placeholder="Buscar servicios..."
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-sm text-zinc-500">
              Cargando servicios...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-sm text-zinc-500">
              {searchTerm
                ? "Sin resultados para la busqueda."
                : "No hay servicios registrados aun."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="cms-table-head">
                  <tr>
                    <th className="font-medium">Servicio</th>
                    <th className="text-right font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((item) => (
                    <tr key={item.id} className="cms-table-row">
                      <td className="text-zinc-200">{item.service}</td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
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
