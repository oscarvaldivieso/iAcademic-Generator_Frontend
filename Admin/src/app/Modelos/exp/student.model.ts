  export class Students {
    est_codigo: string = '';           // Código del estudiante (número de cuenta)
    est_nombre: string = ''; 
    est_fecha_nac: Date = new Date();  // Fecha de nacimiento
    est_indice_general: string = '';           // Género (M/F)
    est_indice_graduacion: string = '';           // Correo electrónico
    car_codigo: string = '';         // Teléfono
    car_nombre: string = '';         // Nombre de la carrera
    cam_codigo: string = '';        // Código del campus
    cam_nombre: string = '';        // Nombre del campus
    gru_codigo: string = '';       // Código del grupo
    gru_nombre: string = '';       // Nombre del grupo
    active: boolean = true;            // Estado activo/inactivo
    created_by: string = '';           // Usuario que creó el registro
    updated_by: string = '';           // Usuario que actualizó el registro
    created_at: Date = new Date();     // Fecha de creación
    updated_at: Date = new Date();     // Fecha de actualización
    code_Status: number = 0;           // Código de estado (para respuestas API)
    message_Status: string = '';       // Mensaje de estado (para respuestas API)

    constructor(init?: Partial<Students>) {
        Object.assign(this, init);
    }
}