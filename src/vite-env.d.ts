/// <reference types="vite/client" />

interface ImportMeta {
  glob: (
    pattern: string,
    options?: {
      query?: string;
      import?: string;
      eager?: boolean;
      as?: string;
      exhaustively?: boolean;
    },
  ) => Record<string, unknown>;
}
