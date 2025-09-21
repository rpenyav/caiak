import React from "react";
import { useAuth } from "@/auth";

const DashboardPage: React.FC = () => {
  const { logout } = useAuth();

  return (
    <div>
      <h1>Dashboard</h1>
    </div>
  );
};

export default DashboardPage;
