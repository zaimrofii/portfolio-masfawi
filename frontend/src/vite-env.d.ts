/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  /** Aktifkan MSW di build production (mis. demo Vercel). */
  readonly VITE_USE_MOCK?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}