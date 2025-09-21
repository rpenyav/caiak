// MenuContent.tsx
import React from "react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";

const MenuContent = () => {
  const { t } = useTranslation();
  return (
    <ul className="navbar-nav gap-2">
      <li className="nav-item">
        <NavLink to="/dashboard" className="nav-link menu-link">
          {t("menu.dashboard")}
        </NavLink>
      </li>
      <li className="nav-item">
        <NavLink to="/expedients" className="nav-link menu-link">
          {t("menu.expedients")}
        </NavLink>
      </li>
      {/* <li className="nav-item">
        <NavLink to="/agenda" className="nav-link menu-link">
          {t("menu.agenda")}
        </NavLink>
      </li> */}
      <li className="nav-item">
        <NavLink to="/facturacio" className="nav-link menu-link">
          {t("menu.facturacio")}
        </NavLink>
      </li>
      <li className="nav-item">
        <NavLink to="/visites" className="nav-link menu-link">
          {t("menu.visites")}
        </NavLink>
      </li>

      <li className="nav-item">
        <NavLink to="/pendents" className="nav-link menu-link">
          {t("menu.pendents")}
        </NavLink>
      </li>

      <li className="nav-item">
        <NavLink to="/documentacio" className="nav-link menu-link">
          {t("menu.documentacio")}
        </NavLink>
      </li>
      {/* <li className="nav-item">
        <NavLink to="/perfil" className="nav-link menu-link">
          {t("menu.perfil")}
        </NavLink>
      </li> */}
      <li className="nav-item">
        <NavLink to="/consultes" className="nav-link menu-link">
          {t("menu.consultes")}
        </NavLink>
      </li>

      {/* <li className="nav-item">
        <NavLink to="/backoffice" className="nav-link menu-link">
          {t("menu.backoffice")}
        </NavLink>
      </li> */}
    </ul>
  );
};

export default MenuContent;
