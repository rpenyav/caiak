import React, { useMemo, useState } from "react";
import { WorkspaceService } from "@/application/services/WorkspaceService";
import { useUser } from "@/application/contexts/UserContext";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: (workspaceSlug: string) => void;
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 60);
}

const WorkspaceCreateModal: React.FC<Props> = ({
  open,
  onClose,
  onCreated,
}) => {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const { user } = useUser();

  const disabled = useMemo(() => !name.trim() || !slug.trim(), [name, slug]);

  if (!open) return null;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled || !user) return;
    setLoading(true);
    setErr(null);
    try {
      const svc = new WorkspaceService();
      const created = await svc.createWorkspace({
        slug: slug.trim(),
        name: name.trim(),
        roles: user.roles || [], // del token
      });
      onCreated(created.slug);
      onClose();
    } catch (e: any) {
      setErr(e?.message ?? "Error creando workspace");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-header">
          <h4>Crear workspace</h4>
          <button
            className="headers-button"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
        <form onSubmit={onSubmit} className="modal-body">
          {err && <div className="alert alert-danger">{err}</div>}
          <label className="form-label">Nombre</label>
          <input
            className="form-control"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!slug) setSlug(slugify(e.target.value));
            }}
            placeholder="Mi Empresa"
          />
          <label className="form-label mt-2">Slug</label>
          <input
            className="form-control"
            value={slug}
            onChange={(e) => setSlug(slugify(e.target.value))}
            placeholder="mi-empresa"
          />
          <div className="mt-3 d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-light"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || disabled}
            >
              {loading ? "Creando..." : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkspaceCreateModal;
