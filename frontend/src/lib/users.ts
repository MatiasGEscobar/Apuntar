import api from './api';
import { User, UserStatus } from '../types/user.types';

export const usersService = {
  async getAll(): Promise<User[]> {
    const response = await api.get<User[]>('/users');
    return response.data;
  },

  async getById(id: string): Promise<User> {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  async approve(id: string): Promise<User> {
    const response = await api.patch<User>(`/users/${id}/approve`);
    return response.data;
  },

  async reject(id: string, reason: string): Promise<User> {
    const response = await api.patch<User>(`/users/${id}/reject`, { reason });
    return response.data;
  },

  async suspend(id: string, reason: string): Promise<User> {
    const response = await api.patch<User>(`/users/${id}/suspend`, { reason });
    return response.data;
  },
};