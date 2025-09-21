import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "react-calendar/dist/Calendar.css";
// import { AuthProvider } from "@/auth";
import AppRoutes from "./routes/AppRoutes";
import "./styles/main.scss";
import "./i18n/i18n";
import { AuthProvider } from "./auth";
// import {
//   ExpedientsProvider,
//   FacturacioProvider,
//   UserProvider,
// } from "./domain/contexts";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        {/* <UserProvider>
          <ExpedientsProvider>
            <FacturacioProvider> */}
        <AppRoutes />
        {/* </FacturacioProvider>
          </ExpedientsProvider>
        </UserProvider>*/}
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
