declare global {
  namespace NodeJS {
    export interface ProcessEnv {
      NODE_ENV: "development" | "production";
      DATABASE_URL: string;
      GOOGLE_CLIENT_ID: string;
      GOOGLE_CLIENT_SECRET: string;
      GITHUB_CLIENT_ID: string;
      GITHUB_CLIENT_SECRET: string;
      JWT_SECRET: string;
      JWT_EXPIRY: number;
      HTTP_PORT: number;
      WS_PORT: number;
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
