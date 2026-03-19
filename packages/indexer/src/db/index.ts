import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

export * from "./schema";

export interface DatabaseConfig {
  connectionString?: string;
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
  ssl?: boolean;
}

export function createDatabase(config: DatabaseConfig) {
  const pool = new Pool(
    config.connectionString
      ? { connectionString: config.connectionString }
      : {
          host: config.host ?? "localhost",
          port: config.port ?? 5432,
          database: config.database ?? "njord_indexer",
          user: config.user ?? "postgres",
          password: config.password,
          ssl: config.ssl ? { rejectUnauthorized: false } : undefined,
        }
  );

  const db = drizzle(pool, { schema });

  return { db, pool };
}

export type Database = ReturnType<typeof createDatabase>["db"];
