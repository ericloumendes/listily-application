import { apiRequest } from "../config/api";
import { Usuario } from "../interfaces/usuario_interface";
import { jwtDecode } from "jwt-decode";"jwt-decode";

type RegisterResponse = {
  id: number;
  nome: string;
  email: string;
  rg: string;
  createdAt?: string;
};

type LoginResponse = {
  token: string;
};

export async function registerUsuario(user: Usuario): Promise<RegisterResponse> {
  // backend route example: /usuarios or /auth/register — adjust to your API
  return apiRequest<RegisterResponse>("/usuario", "POST", user);
}

// Optional: keep here so other screens can reuse.
export async function loginUsuario(email: string, senha: string): Promise<LoginResponse> {
  return apiRequest<LoginResponse>("/auth/login", "POST", { email, password: senha });
}


// Decode JWT to get user id
function decodeJwt(token: string): { pk: number; email: string; nome: string } {
  return jwtDecode(token);
}

// Retrieve user data using JWT token and id
export async function getUserInfo(token: string): Promise<Usuario> {
  const { pk } = decodeJwt(token); // Decode JWT to get user id
  return apiRequest<Usuario>(`/usuario/${pk}`, "GET", undefined, token); // Use the id in the route
}

// Update user data using JWT token and id
export async function updateUserInfo(user: Usuario, token: string): Promise<Usuario> {
  const { pk } = decodeJwt(token); // Decode JWT to get user id
  user.senha = null;
  user.data_criacao = null;
  return apiRequest<Usuario>(`/usuario/${pk}`, "PUT", user, token); // Use the id in the route
}


