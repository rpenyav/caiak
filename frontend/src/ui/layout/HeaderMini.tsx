// src/ui/layout/HeaderMini.tsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom"; // 👈
import { useAuth } from "@/auth";
import {
  LogoCaiak,
  IconLogout,
  IconMinus,
  IconClose,
  IconSettings,
} from "../components";

type HeaderMiniProps = {
  onMinimize?: () => void;
  onClose?: () => void;
  mode?: "mini" | "desktop";
};

const HeaderMini = ({
  onMinimize,
  onClose,
  mode = "mini",
}: HeaderMiniProps) => {
  const { logout } = useAuth();
  const navigate = useNavigate(); // 👈
  const [open, setOpen] = useState(false);

  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const handleLogout = () => logout();

  const manageDropdown = () => {
    setOpen((v) => {
      const next = !v;
      console.log("[HeaderMini] manageDropdown ->", next);
      return next;
    });
  };

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => {
        const el = menuRef.current;
        if (el) {
          const z = getComputedStyle(el).zIndex;
          const rect = el.getBoundingClientRect();
          console.log("[HeaderMini] dropdown open: zIndex:", z, "rect:", rect);
        }
      });
    }
  }, [open]);

  useEffect(() => {
    const onDocPointer = (e: MouseEvent | TouchEvent) => {
      if (!open) return;
      const target = e.target as Node;
      const menu = menuRef.current;
      const btn = btnRef.current;
      if (!menu || !btn) return;
      if (!menu.contains(target) && !btn.contains(target)) {
        console.log("[HeaderMini] click fuera -> cerrar dropdown");
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (open && e.key === "Escape") {
        console.log("[HeaderMini] ESC -> cerrar dropdown");
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocPointer);
    document.addEventListener("touchstart", onDocPointer, { passive: true });
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocPointer);
      document.removeEventListener("touchstart", onDocPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const showWindowControls = mode === "mini" && (!!onMinimize || !!onClose);

  // 👇 helpers de navegación
  const goPerfil = () => {
    setOpen(false);
    navigate("/perfil");
  };
  const goSettings = () => {
    setOpen(false);
    navigate("/settings");
  };
  const goDashboard = () => {
    setOpen(false);
    navigate("/dashboard");
  };

  return (
    <header className="header-custom-mini">
      <div className="d-flex justify-content-between align-items-center w-100">
        <div className="part1">
          <div className="ms-2">
            <LogoCaiak />
          </div>
          <div className="divider-left-white" />
        </div>

        <div className="part2">
          {/* SETTINGS SIEMPRE visible */}
          <div className="caiak-dropdown-wrap" data-open={open}>
            <button
              ref={btnRef}
              className="headers-button"
              onClick={manageDropdown}
              aria-haspopup="menu"
              aria-expanded={open}
              aria-label="Settings"
              title="Settings"
              type="button"
            >
              <IconSettings width={20} height={20} />
            </button>

            {open && (
              <div
                ref={menuRef}
                className="caiak-dropdown-menu caiak-dropdown-menu--right"
                role="menu"
              >
                {" "}
                <button
                  className="caiak-dropdown-item"
                  role="menuitem"
                  onClick={goDashboard}
                >
                  Inicio
                </button>
                <button
                  className="caiak-dropdown-item"
                  role="menuitem"
                  onClick={goPerfil}
                >
                  Perfil
                </button>
                <button
                  className="caiak-dropdown-item"
                  role="menuitem"
                  onClick={goSettings}
                >
                  Preferencias
                </button>
                <div className="caiak-dropdown-sep" />
                <button
                  className="caiak-dropdown-item"
                  role="menuitem"
                  onClick={() => {
                    setOpen(false);
                    handleLogout();
                  }}
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>

          {/* Minimizar / Cerrar */}
          {showWindowControls && (
            <>
              <button
                className="headers-button ms-3"
                onClick={() => onMinimize?.()}
                aria-label="Minimizar"
                title="Minimizar"
                disabled={!onMinimize}
                type="button"
              >
                <IconMinus width={16} height={16} />
              </button>
              <button
                className="headers-button ms-3"
                onClick={() => onClose?.()}
                aria-label="Cerrar"
                title="Cerrar"
                disabled={!onClose}
                type="button"
              >
                <IconClose width={14} height={14} />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default HeaderMini;
