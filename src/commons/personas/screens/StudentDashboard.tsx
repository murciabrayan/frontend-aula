import { usePageLoader } from "@/hooks/usePageLoader";

const StudentDashboard = () => {
   usePageLoader();
  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold text-purple-700">Panel de Estudiante</h1>
      <p className="mt-4">Bienvenido, aquí podrás ver tus cursos y calificaciones.</p>
    </div>
  );
};

export default StudentDashboard;
