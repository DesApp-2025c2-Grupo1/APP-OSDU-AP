import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:9002'
});

export const usuariosAPI = {
  login: (dni: string, password: string) =>
    client.post('/affiliates/usuarios/login', { dni, password }),

  getMe: (id: number) =>
    client.get(`/affiliates/usuarios/me?id=${id}`),

  getFamilia: (id: number) =>
    client.get(`/affiliates/usuarios/${id}/familia`)
};

export default client;
