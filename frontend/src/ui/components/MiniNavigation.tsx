// src/ui/components/MiniNavigation.tsx
import React, { useEffect, useState } from "react";
import IconDialog from "./icons/IconDialog";
import { IconClose, SidebarList } from "./"; // asegúrate de que exportas IconClose desde tu barrel

const ANIM_MS = 280;

const MiniNavigation: React.FC = () => {
  const [mounted, setMounted] = useState(false); // en el DOM
  const [open, setOpen] = useState(false); // estado visual (transform)

  const openDrawer = () => {
    setMounted(true);
    requestAnimationFrame(() => setOpen(true));
  };

  const closeDrawer = () => {
    setOpen(false);
    // esperamos a que termine la transición para desmontar del DOM
    window.setTimeout(() => setMounted(false), ANIM_MS);
  };

  const toggleDrawer = () => {
    if (mounted && open) closeDrawer();
    else openDrawer();
  };

  // Cerrar con Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (open && e.key === "Escape") closeDrawer();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Bloquear scroll del body mientras está abierto (opcional)
  useEffect(() => {
    if (!mounted) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mounted]);

  return (
    <div className="chat-content-back ps-3  pt-1 pb-1">
      <button
        type="button"
        className="beadcrumb-button"
        onClick={toggleDrawer}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="mini-conversations-drawer"
        title="Conversations"
      >
        <IconDialog color="#ffffff" height={30} width={30} />
        <span className="ms-2 mini-nav-trigger__label">Conversations</span>
      </button>

      {mounted && (
        <div
          id="mini-conversations-drawer"
          className="caiak-drawer"
          role="dialog"
          aria-modal="true"
        >
          <div
            className={`caiak-drawer__overlay ${open ? "is-in" : ""}`}
            onClick={closeDrawer}
          />
          <aside
            className={`caiak-drawer__panel ${open ? "is-in" : ""}`}
            aria-label="Conversations"
          >
            {/* <div className="caiak-drawer__header">
              <button
                type="button"
                className="beadcrumb-button"
                onClick={closeDrawer}
                aria-label="Cerrar"
                title="Cerrar"
              >
                <IconClose width={14} height={14} /> Conversations
              </button>
            </div> */}

            <div className="caiak-drawer__body">
              <SidebarList chatmode="mini" />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default MiniNavigation;
