import { from } from "rxjs";
import { map, mergeMap } from "rxjs/operators";
import { dbDefaultConnection } from "./Connection";
import crypto from "crypto";
import * as models from "./models";

export function synchronize() {
  return dbDefaultConnection()
    .pipe(
      mergeMap((conn) => {
        return from(conn.synchronize());
      })
    )
    .pipe(
      map(() => {
        return "OK";
      })
    );
}

export function clear() {
  return dbDefaultConnection()
    .pipe(
      mergeMap((conn) => {
        return from(conn.getRepository(models.User).delete({})).pipe(
          mergeMap(() => {
            return from(conn.getRepository(models.Session).delete({}));
          })
        );
      })
    )
    .pipe(
      map(() => {
        return "OK";
      })
    );
}

export function makePasswordHash(s: string) {
  return crypto.createHash("sha256").update(s, "utf8").digest("hex");
}
