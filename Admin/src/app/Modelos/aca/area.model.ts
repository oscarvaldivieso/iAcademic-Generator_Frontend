export class Areas {
    are_codigo: string = '';           // Código del area
    are_nombre: string = ''; 
    active: boolean = true;            // Estado activo/inactivo
    created_by: string = '';           // Usuario que creó el registro
    updated_by: string = '';           // Usuario que actualizó el registro
    created_at: Date = new Date();     // Fecha de creación
    updated_at: Date = new Date();     // Fecha de actualización
    code_Status: number = 0;           // Código de estado (para respuestas API)
    message_Status: string = '';       // Mensaje de estado (para respuestas API)

    constructor(init?: Partial<Areas>) {
        Object.assign(this, init);
    }
}