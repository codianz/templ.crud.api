import { getAppConfig } from "./AppConfig";
import { Debug as log } from "./util/log/Debug";
import * as db from "./db";

const LOG = log("app:main");

const config = getAppConfig();
db.setDefaultConnectInfo(config.dbConnect);
