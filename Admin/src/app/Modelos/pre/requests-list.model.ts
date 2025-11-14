export class RequestsList {
    pre_codigo: number = 0;           // Código del estudiante (número de cuenta)
    pre_codest: string = ''; 
    pre_estado: string = '';  // Fecha de nacimiento
    pre_fecha: Date = new Date();          // Correo electrónico
    pre_observacion: string = ''; 
    mat_codigo: string = ''; 
    mat_nombre: string = '';
    doc_codigo: string = '';
    doc_nombre: string = '';
    mod_codigo: string = '';
    mod_nombre: string = '';
    cam_codigo: string = '';
    cam_nombre: string = '';
    per_codigo: string = '';
    periodo: string = '';
    pre_prioridad: boolean = false;
    hor_codigo: number = 0;
    hor_dia_semana_nombre: string = '';      
    created_at: Date = new Date();     
    updated_at: Date | null = null;      

    constructor(init?: Partial<RequestsList>) {
        Object.assign(this, init);
    }
}