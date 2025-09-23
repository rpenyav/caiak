import React from "react";
import { AvatarComponent, SidebarSearch, SidebarList } from "../../components";

const Sidebar = () => {
  return (
    <div className="sidebar-custom pt-4 p-0 m-0">
      <AvatarComponent />
      <SidebarSearch />
      <SidebarList chatmode="desktop" />
    </div>
  );
};

export default Sidebar;
