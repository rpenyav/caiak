import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import ChatMiniContainer from "./mini/ChatMiniContainer";
import { ChatBubble } from "../components";
import ModeProviders from "./ModeProviders";
import Desktop from "./desktop/Desktop";

const chatMode = import.meta.env.VITE_CHAT_MODE as "mini" | "desktop";

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
      {/* Cuando el mode es MINI aparece el bubblechat  */}
      {chatMode === "mini" && !isChatOpen && (
        <ChatBubble onClick={() => setIsChatOpen((v) => !v)} />
      )}
      {/* Cuando el mode es MINI  */}
      {chatMode === "mini" && isChatOpen && (
        <ModeProviders mode="mini">
          <ChatMiniContainer onMinimize={handleMinimize} onClose={handleClose}>
            {children}
          </ChatMiniContainer>
        </ModeProviders>
      )}

      {/* Cuando el mode es DESKTOP  */}
      {chatMode === "desktop" && (
        <ModeProviders mode="desktop">
          <Desktop children={children} />
        </ModeProviders>
      )}
    </div>
  );
};

export default Layout;
