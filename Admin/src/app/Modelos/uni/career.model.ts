export class Careers{
  car_codigo: string = '';
  car_nombre: string = '';
  car_anio_plan: number = 0;
  car_orientacion: string = '';
  active: boolean = true;
  created_by: string = '';
  updated_by: string = '';
  created_at: Date = new Date();
  updated_at: Date = new Date();
  code_Status: number = 0;
  message_Status: string ='';

  constructor(init?: Partial<Careers>) {
    Object.assign(this, init);
  }
}
