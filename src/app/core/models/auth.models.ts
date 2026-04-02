export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string | null;
  role: 'ADMIN' | 'MANAGER' | 'USER';
  userId: number;
  mustChangePassword: boolean;
}

export interface JwtPayload {
  sub: string;
  role: 'ADMIN' | 'MANAGER' | 'USER';
  userId: number;
  exp: number;
  iat: number;
}