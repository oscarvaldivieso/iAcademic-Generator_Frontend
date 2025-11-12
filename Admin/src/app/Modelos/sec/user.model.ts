export interface User {
  usu_codigo?: string;
  usu_nombre: string;
  usu_password: string;
  usu_email: string;
  usu_activo: boolean;
  usu_ultimo_login?: Date;
  usu_intentos_fallidos?: number;
  usu_bloqueado?: boolean;
  active: number;
  create_at?: Date;
  update_at?: Date;
  created_by?: string;
  updated_by?: string;
  est_codigo?: string;
  doc_codigo?: string;
}