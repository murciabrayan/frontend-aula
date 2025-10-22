import React, { useState } from "react";
import SidebarAdmin from "../components/SidebarAdmin";
import HeaderAdmin from "../components/HeaderAdmin";
import AdminContent from "../components/AdminContent";
import "@/commons/personas/styles/adminDashboard.css";

const AdminDashboard: React.FC = () => {
  const [activeModule, setActiveModule] = useState("inicio");

  return (
    <div className="admin-dashboard">
      <SidebarAdmin setActiveModule={setActiveModule} />
      <div className="admin-main">
        <HeaderAdmin />
        <AdminContent activeModule={activeModule} />
      </div>
    </div>
  );
};

export default AdminDashboard;
