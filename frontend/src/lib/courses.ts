import api from './api';

export interface Course {
  id: string;
  title: string;
  description: string;
  image: string;
  price: number;
  discountPrice?: number;
  promoLabel?: string;
  startDate: string;
  schedule: string;
  totalSpots: number;
  availableSpots: number;
  isActive: boolean;
  location: string;
  createdAt: string;
  termsAndConditions?: string;
}

export const coursesService = {
  async getAll(): Promise<Course[]> {
    const response = await api.get<Course[]>('/courses');
    return response.data;
  },

  async getAllAdmin(): Promise<Course[]> {
    const response = await api.get<Course[]>('/courses?all=true');
    return response.data;
  },

  async getById(id: string): Promise<Course> {
    const response = await api.get<Course>(`/courses/${id}`);
    return response.data;
  },

  async create(data: Partial<Course>): Promise<Course> {
    const response = await api.post<Course>('/courses', data);
    return response.data;
  },

  async update(id: string, data: Partial<Course>): Promise<Course> {
    const response = await api.patch<Course>(`/courses/${id}`, data);
    return response.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/courses/${id}`);
  },
};