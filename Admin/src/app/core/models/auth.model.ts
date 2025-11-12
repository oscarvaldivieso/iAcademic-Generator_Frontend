export interface LoginRequest {
    user: string;
    password: string;
}

export interface LoginResponse {
    type: number;
    code: number;
    success: boolean;
    message: string;
    data: AuthData;
}

export interface AuthData {
    token: string;
    usu_codigo: string;
    usu_nombre: string;
    usu_email: string;
    tipo_usuario: string;
    roles: string;
    expires_at: string;
}

export interface ErrorResponse {
    type: number;
    code: number;
    success: boolean;
    message: string;
    data: ErrorData;
}

export interface ErrorData {
    code: string;
    message: string;
    intentosRestantes: number;
}