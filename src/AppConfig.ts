import * as db from "./db";

export function getAppConfig() {
  return {
    slotName:
      process.env["_SLOT_NAME"] ??
      ("local" as "local" | "development" | "staging" | "production"),
    dbConnect: {
      host: process.env["_DB_HOST"] ?? "127.0.0.1",
      port: parseInt(process.env["_DB_PORT"] ?? "55001"),
      username: process.env["_DB_USERNAME"] ?? "sa",
      password: process.env["_DB_PASSWORD"] ?? "P@ssw0rd",
      database: process.env["_DB_DATABSE"] ?? "isou",
      encrypt: parseInt(process.env["_DB_ENCRYPT"] ?? "0") ? true : false,
    } as db.ConnectionInfo,
    storage: {
      connectionString:
        "AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;DefaultEndpointsProtocol=http;BlobEndpoint=http://127.0.0.1:55002/devstoreaccount1;QueueEndpoint=http://127.0.0.1:55003/devstoreaccount1;TableEndpoint=http://127.0.0.1:55004/devstoreaccount1;",
      baseUrl: "http://127.0.0.1:50002/devstoreaccount1",
    },
    port: parseInt(process.env["PORT"] ?? "55000"),
  };
}
