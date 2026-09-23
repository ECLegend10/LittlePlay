import { drizzle } from "drizzle-orm/sqlite-proxy";
import { queryD1 } from "../lib/d1";
import * as schema from "./schema";

export function getDb() {
  return drizzle(async (sql, params, method) => {
    const result = await queryD1(sql, params);
    const rows = result.results.map((row) => Object.values(row));
    return { rows: method === 'get' ? rows[0] : rows };
  }, { schema });
}
