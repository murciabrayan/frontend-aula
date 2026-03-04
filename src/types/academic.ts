export interface Course {
  id: number;
  nombre: string;
  descripcion?: string;
  docente?: number | null;
}

export interface Subject {
  id: number;
  nombre: string;
  curso: number;
}