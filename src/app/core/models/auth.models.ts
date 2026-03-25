export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface JwtPayload {
  sub: string;
  userId: number;
  role: 'ADMIN' | 'MANAGER' | 'USER';
  exp: number;
}