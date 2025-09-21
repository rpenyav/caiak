import type { ReactNode } from "react";
import { useState } from "react";
import { useAuth } from "@/auth";
import Footer from "./Footer";
import Header from "./Header";
import Main from "./Main";
import ChatMiniContainer from "./ChatMiniContainer";
import ChatPage from "@/ui/pages/ChatPage";
import { ChatBubble } from "../components";

const chatMode = import.meta.env.VITE_CHAT_MODE as "mini" | "desktop";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { isAuthenticated } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(chatMode === "desktop");

  const handleMinimize = () => setIsChatOpen(false);
  const handleClose = () => setIsChatOpen(false);

  return (
    <div className="d-flex flex-column min-vh-100">
      {chatMode === "mini" && !isChatOpen && (
        <ChatBubble onClick={() => setIsChatOpen(true)} />
      )}
      {chatMode === "mini" && isChatOpen && (
        <ChatMiniContainer onMinimize={handleMinimize} onClose={handleClose}>
          {isAuthenticated ? <ChatPage /> : children}
        </ChatMiniContainer>
      )}
      {chatMode === "desktop" && (
        <>
          <Header />
          <Main>{children}</Main>
          <Footer />
        </>
      )}
    </div>
  );
};

export default Layout;
