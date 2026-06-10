/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_HOST_API: string;
  readonly VITE_GOOGLE_CLIENT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.svg" {
  const content: string;
  export default content;
}

declare module "*.css";
