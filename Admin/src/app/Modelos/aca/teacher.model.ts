export class Teachers {
    doc_codigo: string = '';           // Código del estudiante (número de cuenta)
    doc_nombre: string = ''; 
    active: boolean = true;            // Estado activo/inactivo
    created_by: string = '';           // Usuario que creó el registro
    updated_by: string = '';           // Usuario que actualizó el registro
    created_at: Date = new Date();     // Fecha de creación
    updated_at: Date = new Date();     // Fecha de actualización
    code_Status: number = 0;           // Código de estado (para respuestas API)
    message_Status: string = '';       // Mensaje de estado (para respuestas API)

    constructor(init?: Partial<Teachers>) {
        Object.assign(this, init);
    }
}