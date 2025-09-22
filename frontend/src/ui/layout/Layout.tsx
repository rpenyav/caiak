import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useAuth } from "@/auth";
import Footer from "./Footer";
import Header from "./Header";
import Main from "./Main";
import ChatMiniContainer from "./ChatMiniContainer";
// ❌ ya no necesitamos importar ChatPage aquí
// import ChatPage from "@/ui/pages/ChatPage";
import { ChatBubble } from "../components";

const chatMode = import.meta.env.VITE_CHAT_MODE as "mini" | "desktop";

// Persistencia de abierto/cerrado (como ya montamos antes)
const CHAT_OPEN_KEY = "caiak.chatOpen";
const parseBool = (v: string | null) => v === "1" || v === "true";
const loadChatOpen = (fallback = false) => {
  try {
    const raw = localStorage.getItem(CHAT_OPEN_KEY);
    return raw == null ? fallback : parseBool(raw);
  } catch {
    return fallback;
  }
};
const saveChatOpen = (val: boolean) => {
  try {
    localStorage.setItem(CHAT_OPEN_KEY, val ? "1" : "0");
  } catch {}
};

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { isAuthenticated } = useAuth();

  // mini => recuerda estado, desktop => abierto por defecto
  const [isChatOpen, setIsChatOpen] = useState<boolean>(() =>
    chatMode === "desktop" ? true : loadChatOpen(false)
  );

  useEffect(() => {
    if (chatMode === "mini") saveChatOpen(isChatOpen);
  }, [isChatOpen]);

  useEffect(() => {
    if (chatMode !== "mini") return;
    const onStorage = (e: StorageEvent) => {
      if (e.key === CHAT_OPEN_KEY && e.storageArea === localStorage) {
        setIsChatOpen(parseBool(e.newValue));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const handleMinimize = () => setIsChatOpen(false);
  const handleClose = () => setIsChatOpen(false);

  return (
    <div className="w-100 d-flex flex-column min-vh-100">
      {chatMode === "mini" && !isChatOpen && (
        <ChatBubble onClick={() => setIsChatOpen((v) => !v)} />
      )}

      {chatMode === "mini" && isChatOpen && (
        <ChatMiniContainer onMinimize={handleMinimize} onClose={handleClose}>
          {/* ✅ AHORA mostramos siempre el children de la ruta ACTUAL */}
          {children}
        </ChatMiniContainer>
      )}

      {chatMode === "desktop" && (
        <>
          {isAuthenticated && <Header />}
          {isAuthenticated ? <Main /> : children}
          {isAuthenticated && <Footer />}
        </>
      )}
    </div>
  );
};

export default Layout;
