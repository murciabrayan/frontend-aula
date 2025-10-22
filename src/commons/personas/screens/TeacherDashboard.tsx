import { usePageLoader } from "@/hooks/usePageLoader";

const TeacherDashboard = () => {
    usePageLoader();
  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold text-green-700">Panel de Docente</h1>
      <p className="mt-4">Aquí puedes gestionar tus clases y estudiantes.</p>
    </div>
  );
};

export default TeacherDashboard;
