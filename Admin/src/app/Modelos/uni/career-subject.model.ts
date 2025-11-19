export interface CareerSubject {
  mat_codigo: string;
  mat_nombre: string;
  mat_anio: number | null;
  mat_unidades_valorativas: number | null;
  mat_duracion_clase: number | null;
  mat_es_core: boolean;
  per_trimestre: string | null;
  car_plan_modulo: string | null;
  mat_anio_carrera: number | null;
  mat_obligatoria: boolean;
  mat_orden: number | null;
  cursada: boolean;
  prerrequisitos: string | null;
  total_prerrequisitos: number;
  puede_cursar: boolean;
  prerrequisitos_faltantes: string | null;
}
