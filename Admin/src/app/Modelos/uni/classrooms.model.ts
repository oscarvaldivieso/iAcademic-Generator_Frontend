export class Classroom {
  auc_codigo: string = '';
  cam_codigo: string = '';
  active: boolean = true;
  created_at: Date = new Date();
  updated_at: Date | null = null;
  created_by: string = '';
  updated_by: string | null = null;
  code_Status: number = 0;
  message_Status: string = '';

  constructor(init?: Partial<Classroom>) {
    Object.assign(this, init);
  }
}