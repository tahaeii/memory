import { apiFetch } from '@/shared/api/http';
import type { CreateUserInput, UpdateUserInput, UserDto } from '@/entities/user';

export const createUser = (input: CreateUserInput) =>
  apiFetch<UserDto>('/users', { method: 'POST', json: input });

export const updateUser = (id: string, patch: UpdateUserInput) =>
  apiFetch<UserDto>('/users/' + id, { method: 'PATCH', json: patch });
