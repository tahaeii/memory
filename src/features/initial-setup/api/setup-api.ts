import { apiFetch } from '@/shared/api/http';

export interface SetupRequest {
  code: string;
  username: string;
  password: string;
  siteName: string;
  organization?: string;
  passcode?: string;
}

export const completeSetup = (input: SetupRequest) => apiFetch('/setup', { method: 'POST', json: input });
