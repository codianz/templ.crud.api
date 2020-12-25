import { ConnectionOptions, createConnection, Connection } from "typeorm";
import { of, from, BehaviorSubject, NEVER } from "rxjs";
import { map, mergeMap, take } from "rxjs/operators";
import { User, Session } from "./models";

export type ConnectionInfo = {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  encrypt: boolean;
};

function buildDbConfig(dbConnect: ConnectionInfo): ConnectionOptions {
  return {
    type: "mssql",
    host: dbConnect.host,
    port: dbConnect.port,
    username: dbConnect.username,
    password: dbConnect.password,
    database: dbConnect.database,
    entities: [User, Session],
    extra: {
      options: {
        enableArithAbort: true,
        encrypt: dbConnect.encrypt,
      },
    },
    synchronize: false,
    logging: "all",
    logger: "simple-console",
  };
}

const defaultConnectInfo = new BehaviorSubject<ConnectionInfo | undefined>(
  undefined
);
let defaultConnection: Connection | undefined;

export function setDefaultConnectInfo(connectInfo: ConnectionInfo) {
  defaultConnectInfo.next(connectInfo);
}

export function dbDefaultConnection() {
  if (defaultConnection) {
    return of(defaultConnection);
  } else {
    return defaultConnectInfo
      .asObservable()
      .pipe(
        mergeMap((ci) => {
          if (!ci) return NEVER;
          return of(ci);
        })
      )
      .pipe(take(1))
      .pipe(
        mergeMap((ci) => {
          return dbConnection(ci);
        })
      )
      .pipe(
        map((conn) => {
          defaultConnection = conn;
          return conn;
        })
      );
  }
}

export function dbConnection(dbConnect: ConnectionInfo) {
  return from(createConnection(buildDbConfig(dbConnect)));
}
