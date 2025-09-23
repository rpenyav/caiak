import { useAuth } from "@/auth";
import React, { type ReactNode } from "react";
import { Footer, Header, Sidebar } from "..";
import { Chatbot } from "@/ui/components";

interface LayoutProps {
  children: ReactNode;
}

const Desktop = ({ children }: LayoutProps) => {
  const { isAuthenticated } = useAuth();
  return (
    <div>
      {isAuthenticated && <Header />}
      {isAuthenticated ? (
        <main className="container-fluid m-0 p-0">
          <div className="row m-0 p-0 ">
            <div className=" col-md-2 col-custom-sidebar">
              <Sidebar />
            </div>
            <div className="col-md-10 col-custom-content">
              <div className="area-chat">
                <div className="area-inside-chat">
                  <Chatbot />
                </div>
              </div>
            </div>
          </div>
        </main>
      ) : (
        children
      )}
      {isAuthenticated && <Footer />}
    </div>
  );
};

export default Desktop;
