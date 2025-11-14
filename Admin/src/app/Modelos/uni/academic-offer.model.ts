export class OfferList{
  codigo: string = '';
  materia: string = '';
  dias: string = '';
  bloque: string = '';
  hora: string = '';
  cupos: number =0;
  campus: string = '';
  seccion: string = '';
  docente: string = '';

  constructor(init?: Partial<OfferList>) {
    Object.assign(this, init);
  }
}
