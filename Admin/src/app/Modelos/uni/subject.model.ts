export interface Subject {
  mat_codigo: string;
  mat_nombre: string;
  mat_anio: number;
  mat_duracion_clase: number | null;
  mat_unidades_valorativas: number | null;
  are_codigo: string;
  mat_es_core: boolean;
  active: boolean;
  created_at: string;
  updated_at: string | null;
  created_by: string | null;
  updated_by: string | null;
}
