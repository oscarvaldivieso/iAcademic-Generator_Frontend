export class Modality {
  mod_codigo: string = '';
  mod_nombre: string = '';
  active: boolean = true;
  created_at: Date = new Date();
  updated_at: Date | null = null;
  created_by: string = '';
  updated_by: string | null = null;
  code_Status: number = 0;
  message_Status: string = '';

  constructor(init?: Partial<Modality>) {
    Object.assign(this, init);
  }
}