import "dotenv/config";

import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: "prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19VWVlYXzdfaGV1V1hYaG9Hc0xxOEEiLCJhcGlfa2V5IjoiMDFLOFNNVFJNWDk1NE0xWkpZTVdFME1OOFYiLCJ0ZW5hbnRfaWQiOiJkOTE4NDllZThkZjdiNTRiYzI0NjEwZGQ5NGUzNGRmNjY0ZDVjZmExNDM4NGI0ZWMyZTBmMjhmOGQ2OGE0ZjNlIiwiaW50ZXJuYWxfc2VjcmV0IjoiYzA3NWI5OGEtMTYzZC00ZWEyLWI1M2ItMThjMWFiZDU3YTM3In0.p_ba7ImKIAfDaJ-cacZV8lzsK3c45xrJ4rPmivwgyL0",
  },
});
