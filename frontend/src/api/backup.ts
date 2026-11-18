import api from './client';

export interface BackupResponse {
  ok: boolean;
  message: string;
}

/** POST /backup/ — Fase 3: masih dummy (mock MSW). */
export async function backupDatabase(): Promise<BackupResponse> {
  const { data } = await api.post<BackupResponse>('/backup/');
  return data;
}