export interface Schedule {
  hor_codigo: number;
  hor_dia_semana: string;
  hor_hora_inicio: string;
  hor_hora_fin: string;
  hor_duracion_minutos: number;
  active: boolean;
  created_at: string;
  updated_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  hor_dia_semana_nombre: string;
}
