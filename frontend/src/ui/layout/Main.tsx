import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import { Chatbot } from "../components";

const Main = () => {
  return (
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
  );
};

export default Main;
