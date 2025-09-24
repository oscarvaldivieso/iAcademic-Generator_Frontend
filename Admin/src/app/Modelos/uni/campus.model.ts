export class Campus {
  cam_codigo: string = '';
  cam_nombre: string = '';
  cam_ciudad: string = '';
  active: boolean = true;
  created_by: string = '';
  updated_by: string | null = null;
  created_at: Date = new Date();
  updated_at: Date | null = null;
  code_Status: number = 0;
  message_Status: string = '';

  constructor(init?: Partial<Campus>) {
    if (init) {
      // Convert numeric active to boolean if needed
      if (typeof init.active === 'number') {
        init.active = init.active === 1;
      }
      
      // Convert string dates to Date objects
      if (init.created_at && typeof init.created_at === 'string') {
        init.created_at = new Date(init.created_at);
      }
      
      if (init.updated_at && typeof init.updated_at === 'string') {
        init.updated_at = new Date(init.updated_at);
      }
      
      Object.assign(this, init);
    }
  }
}