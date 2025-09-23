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
import { useMessages } from "@/application/contexts/MessagesContext";

interface SidebarListProps {
  chatmode: "mini" | "desktop";
}

const LS_EXPANDED = "caiak:wsExpanded";

function readExpandedMap(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(LS_EXPANDED);
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}
function writeExpandedMap(next: Record<string, boolean>) {
  try {
    localStorage.setItem(LS_EXPANDED, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}
function setExpandedStored(slug: string, value: boolean) {
  const map = readExpandedMap();
  map[slug] = value;
  writeExpandedMap(map);
}

const SidebarList: React.FC<SidebarListProps> = ({ chatmode }) => {
  const ns = chatmode === "mini" ? "menu-mini" : "menu";
  const cls = (suffix = "") => (suffix ? `${ns}${suffix}` : ns);

  const { workspaces, loading, error } = useWorkspaces();
  const { stateByWorkspace, toggleWorkspace, refreshWorkspace } =
    useConversations();
  const { state: msgState, openConversation } = useMessages();

  const prefetchedSlugsRef = useRef<Set<string>>(new Set());
  const appliedRestoreRef = useRef<Set<string>>(new Set()); // ← evita re-aplicar restore por slug

  // Prefetch de conversaciones por workspace (tal como ya tenías)
  useEffect(() => {
    if (loading || error || workspaces.length === 0) return;

    for (const ws of workspaces) {
      const slug = ws.slug;
      if (prefetchedSlugsRef.current.has(slug)) continue;

      const wsState = stateByWorkspace[slug];
      const hasItems = wsState?.items?.length > 0;
      const isLoading = wsState?.loading;

      if (!wsState || (!hasItems && !isLoading)) {
        prefetchedSlugsRef.current.add(slug);
        void refreshWorkspace(slug);
      } else {
        prefetchedSlugsRef.current.add(slug);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, error, workspaces, refreshWorkspace, stateByWorkspace]);

  // ✅ Restaurar expand/collapse desde localStorage
  useEffect(() => {
    if (loading || error || workspaces.length === 0) return;

    const stored = readExpandedMap();
    for (const ws of workspaces) {
      const want = stored[ws.slug];
      if (typeof want !== "boolean") continue; // no hay preferencia guardada

      // evita re-aplicar para el mismo slug
      if (appliedRestoreRef.current.has(ws.slug)) continue;

      const currExpanded = stateByWorkspace[ws.slug]?.expanded ?? false;
      if (want !== currExpanded) {
        appliedRestoreRef.current.add(ws.slug);
        // Alinea el estado: si queremos expandir y ahora está colapsado (o viceversa)
        void toggleWorkspace(ws.slug);
      } else {
        appliedRestoreRef.current.add(ws.slug);
      }
    }
  }, [loading, error, workspaces, stateByWorkspace, toggleWorkspace]);

  const handleWorkspaceClick = useCallback(
    async (slug: string) => {
      const wsState = stateByWorkspace[slug];
      const isExpanded = wsState?.expanded ?? false;

      // Si está expandido → colapsar
      if (isExpanded) {
        setExpandedStored(slug, false); // persistimos next state
        await toggleWorkspace(slug);
        return;
      }

      // Si NO estaba expandido: asegurar datos y luego expandir
      const hasLoadedOnce = !!wsState;
      const hasItems = wsState?.items?.length > 0;

      if (!hasLoadedOnce || (!hasItems && !wsState?.loading)) {
        prefetchedSlugsRef.current.add(slug);
        await refreshWorkspace(slug);
      }

      // Decide si puede expandir
      const after = stateByWorkspace[slug];
      const canExpand = !!after && after.items && after.items.length > 0;

      // Persistimos que el siguiente estado será expandido (aunque no expanda si no hay items)
      setExpandedStored(slug, true);

      if (canExpand) {
        await toggleWorkspace(slug);
      }
    },
    [stateByWorkspace, toggleWorkspace, refreshWorkspace]
  );

  return (
    <div className={`${cls()} ${cls("--scrollable")}`}>
      <div className={cls("-separator")} />

      {loading && (
        <>
          <div className={cls("-item")}>
            <LoaderSmall />
            <div className={cls("-label")}>Cargando workspaces…</div>
          </div>
          <div className={cls("-item")}>
            <LoaderSmall />
            <div className={cls("-label")}>Cargando workspaces…</div>
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
                className={cls("-item-workspaces")}
                onClick={() => void handleWorkspaceClick(ws.slug)}
                aria-expanded={expanded}
                aria-controls={`ws-${ws.slug}-panel`}
                style={{ cursor: canExpand ? "pointer" : "default" }}
              >
                <div className={cls("-icon")}>
                  <IconFolder
                    height={16}
                    color={chatmode === "mini" ? " #000000" : " #ffffff"}
                    hoverColor="#d4a017"
                  />
                </div>

                <div className={cls("-label")} title={ws.name}>
                  {truncateText(ws.name ?? "", 28, { byWords: true })}
                </div>

                <div className={cls("-shortcut")}>
                  {expanded ? (
                    <IconDownCaret
                      color={chatmode === "mini" ? " #000000" : " #ffffff"}
                    />
                  ) : canExpand ? (
                    <IconRightCaret
                      color={chatmode === "mini" ? " #000000" : " #ffffff"}
                    />
                  ) : (
                    <IconMinus
                      color={chatmode === "mini" ? " #000000" : " #ffffff"}
                    />
                  )}
                </div>

                <div className={cls("-description")}>
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
                <div
                  id={`ws-${ws.slug}-panel`}
                  className={`${cls("-sublist")} ms-3`}
                >
                  {convLoading && (
                    <div className={cls("-item-conversations")}>
                      <LoaderSmall />
                    </div>
                  )}

                  {!convLoading && convError && (
                    <div className="alert alert-danger">{convError}</div>
                  )}

                  {!convLoading &&
                    !convError &&
                    conversations.map((c) => {
                      const selected =
                        msgState.selectedConversationId === c._id;
                      return (
                        <div
                          key={c._id}
                          className={`${cls("-item-conversations")}${
                            selected ? " is-selected" : ""
                          }`}
                          onClick={() =>
                            void openConversation(c._id, ws.slug, c.name)
                          }
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) =>
                            e.key === "Enter" &&
                            openConversation(c._id, ws.slug, c.name)
                          }
                        >
                          <div className={cls("-icon")}>
                            <IconDialog
                              color={
                                chatmode === "mini" ? " #000000" : " #ffffff"
                              }
                            />
                          </div>
                          <div className={cls("-label")} title={c.name}>
                            {truncateText(c.name ?? "", 28, { byWords: true })}
                          </div>
                          <div className={cls("-shortcut")}>
                            {new Date(c.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          );
        })}

      <div className={cls("-separator")} />
    </div>
  );
};

export default SidebarList;
