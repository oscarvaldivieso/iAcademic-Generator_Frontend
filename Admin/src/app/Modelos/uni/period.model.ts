export class Period {
  per_codigo: string = '';
  per_modulo: string = '';
  per_anio: number = new Date().getFullYear();
  per_inicio: Date = new Date();
  per_fin: Date = new Date();
  active: boolean = true;
  created_by: string = '';
  updated_by: string = '';
  created_at: Date = new Date();
  updated_at: Date = new Date();
  code_Status: number = 0;
  message_Status: string = '';

  constructor(init?: Partial<Period>) {
    Object.assign(this, init);
  }
}