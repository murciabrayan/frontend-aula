import { usePageLoader } from "@/hooks/usePageLoader";

const AdminDashboard = () => {
usePageLoader();
    return (
    
    <div className="p-10">
      <h1 className="text-3xl font-bold text-blue-700">Panel de Administrador</h1>
      <p className="mt-4">Bienvenido al área de administración del sistema.</p>
    </div>
  );
};

export default AdminDashboard;
