// src/ui/components/SidebarList.tsx
import React, { useCallback, useEffect, useRef } from "react";
import { useWorkspaces, useConversations } from "@/application/contexts";

import LoaderSmall from "./LoaderSmall";
import {
  IconFolder,
  IconDownCaret,
  IconMinus,
  IconRightCaret,
  IconDialog,
} from "./";
import { truncateText } from "@/application/utils/text";

const SidebarList: React.FC = () => {
  const { workspaces, loading, error } = useWorkspaces();
  const { stateByWorkspace, toggleWorkspace, refreshWorkspace } =
    useConversations();

  // 🧠 Recordamos qué slugs ya intentamos precargar para no repetir
  const prefetchedSlugsRef = useRef<Set<string>>(new Set());

  // 🚀 Prefetch de conversaciones al tener workspaces tras el login (una sola vez por slug)
  useEffect(() => {
    if (loading || error || workspaces.length === 0) return;

    // (Opcional) limitar número a precargar si tienes muchísimos workspaces:
    // const toPrefetch = workspaces.slice(0, 5);
    const toPrefetch = workspaces;

    for (const ws of toPrefetch) {
      const slug = ws.slug;
      if (prefetchedSlugsRef.current.has(slug)) continue;

      const wsState = stateByWorkspace[slug];
      const hasItems = wsState?.items?.length > 0;
      const isLoading = wsState?.loading;

      // Marcamos como "prefetched" ANTES de lanzar para evitar re-entradas
      if (!wsState || (!hasItems && !isLoading)) {
        prefetchedSlugsRef.current.add(slug);
        void refreshWorkspace(slug);
      } else {
        // Ya hay items o está cargando: también lo marcamos para no insistir
        prefetchedSlugsRef.current.add(slug);
      }
    }
    // 👇 OJO: intencionadamente NO dependemos de stateByWorkspace para evitar bucles
  }, [loading, error, workspaces, refreshWorkspace, stateByWorkspace]);

  const handleWorkspaceClick = useCallback(
    async (slug: string) => {
      const wsState = stateByWorkspace[slug];

      // Si ya está expandido, colapsamos directamente.
      if (wsState?.expanded) {
        await toggleWorkspace(slug);
        return;
      }

      // Si NO tenemos items cargados todavía, intentamos cargarlos primero.
      const hasLoadedOnce = !!wsState;
      const hasItems = wsState?.items?.length > 0;

      if (!hasLoadedOnce || (!hasItems && !wsState?.loading)) {
        // Marcamos también aquí para evitar que el efecto vuelva a disparar
        prefetchedSlugsRef.current.add(slug);
        await refreshWorkspace(slug);
      }

      const after = stateByWorkspace[slug];
      const canExpand = !!after && after.items && after.items.length > 0;

      if (canExpand) {
        await toggleWorkspace(slug);
      }
    },
    [stateByWorkspace, toggleWorkspace, refreshWorkspace]
  );

  return (
    <div className="menu menu--scrollable">
      <div className="menu-separator"></div>

      {loading && (
        <>
          <div className="menu-item">
            <LoaderSmall />
            <div className="menu-label">Cargando workspaces…</div>
          </div>
          <div className="menu-item">
            <LoaderSmall />
            <div className="menu-label">Cargando workspaces…</div>
          </div>
        </>
      )}

      {!loading && error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && workspaces.length === 0 && (
        <div className="no-workspaces">No se encontraron workspaces</div>
      )}

      {!loading &&
        !error &&
        workspaces.map((ws) => {
          const wsState = stateByWorkspace[ws.slug];
          const expanded = wsState?.expanded ?? false;
          const convLoading = wsState?.loading ?? false;
          const convError = wsState?.error ?? null;
          const conversations = wsState?.items ?? [];
          const canExpand = conversations.length > 0;

          return (
            <div key={ws._id}>
              <button
                type="button"
                className="menu-item-workspaces"
                onClick={() => void handleWorkspaceClick(ws.slug)}
                aria-expanded={expanded}
                aria-controls={`ws-${ws.slug}-panel`}
                style={{ cursor: canExpand ? "pointer" : "default" }}
              >
                <div className="menu-icon">
                  <IconFolder
                    height={16}
                    color="#ffffff"
                    hoverColor="#d4a017"
                  />
                </div>
                <div className="menu-label">
                  {truncateText(ws.name ?? "", 28, { byWords: true })}
                </div>
                <div className="menu-shortcut">
                  {expanded ? (
                    <IconDownCaret />
                  ) : canExpand ? (
                    <IconRightCaret />
                  ) : (
                    <IconMinus />
                  )}
                </div>
                <div className="menu-description">
                  {canExpand ? (
                    <></>
                  ) : convLoading ? (
                    <LoaderSmall />
                  ) : convError ? (
                    "Error al cargar"
                  ) : (
                    <></>
                  )}
                </div>
              </button>

              {expanded && (
                <div id={`ws-${ws.slug}-panel`} className="menu-sublist ms-3">
                  {convLoading && (
                    <div className="menu-item-conversations">
                      <LoaderSmall />
                    </div>
                  )}

                  {!convLoading && convError && (
                    <div className="alert  alert-danger">{convError}</div>
                  )}

                  {!convLoading &&
                    !convError &&
                    conversations.map((c) => (
                      <div key={c._id} className="menu-item-conversations">
                        <div className="menu-icon">
                          <IconDialog />
                        </div>
                        <div className="menu-label">
                          {truncateText(c.name ?? "", 28, { byWords: true })}
                        </div>
                        <div className="menu-shortcut">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          );
        })}

      <div className="menu-separator"></div>
    </div>
  );
};

export default SidebarList;
