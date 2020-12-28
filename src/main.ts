import { getAppConfig } from "./AppConfig";
import { Debug as log } from "./util/log/Debug";
import * as db from "./db";
import * as util from "./util";
import * as webserv from "./WebServer";
import { map, mergeMap } from "rxjs/operators";
import { of } from "rxjs";

const LOG = log("app:main");

const config = getAppConfig();
db.setDefaultConnectInfo(config.dbConnect);

process.env.TS = "Asia/Tokyo";

const web = new webserv.WebServer(log("app:WebServer"));

// prettier-ignore
util.rx.doSubscribe(
  log("app:main"),
  "main",
  db.tools
  .synchronize()
  .pipe(mergeMap(() => {
    return util.rx.readySetGo(() => {
      web.start({
        port: config.port,
        documentRoot: undefined,
        debuggerPath: "/debugger",
        apiPath: "/api",
      });
    }, web.RequestObservable);
  }))
  .pipe(mergeMap((req: webserv.request_t) => {
    LOG.debug(`method "${req.method}"`);
    switch (req.method) {
      case "post": {
        return doApiJob(req);
      }
      case "socket": {
        return doSocketJob(req);
      }
      case "get": {
        return (
          of(void 0)
          .pipe(mergeMap(() => {
            const a = req.request?.query ?? {};
            return "dbClear" in (req.request?.query ?? {})
              ? db.tools.clear()
              : of(void 0);
          }))
          // .pipe(mergeMap(()=>{
          //   return ("dbCreateDummy" in (req.request?.query ?? {})) ? dbCreateDummy() : of(void 0);
          // }))
          .pipe(map(() => {
            req.response?.sendStatus(200);
          }))
        );
      }
    }
  }))
);

function doApiJob(_: any) {
  return of(void 0);
}
function doSocketJob(_: any) {
  return of(void 0);
}
