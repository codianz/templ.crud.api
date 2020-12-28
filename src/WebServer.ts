import { Subject } from "rxjs";
import express = require("express");
import socketio from "socket.io";
import { SyncSocketIO } from "syncsocketio";
import * as bodyParser from "body-parser";
import { Request, Response } from "express";
import cors from "cors";
import { getAppConfig } from "./AppConfig";
import { LogLike } from "./util/log";

type method_t = "get" | "post" | "socket";

export type config_t = {
  port?: number /* 50080 */;
  documentRoot?: string /* path.resolve(__dirname, '../html') */;
  apiPath?: string /* "/api" */;
  debuggerPath?: string /* "/debugger" */;
};

export type request_t = {
  method: method_t;
  request?: Request;
  response?: Response;
  socket?: SyncSocketIO;
};

export class WebServer {
  private m_subjectRequest = new Subject<request_t>();
  private m_log: LogLike;

  public constructor(log: LogLike) {
    this.m_log = log;
  }

  public get RequestObservable() {
    return this.m_subjectRequest.asObservable();
  }

  public start(config: config_t) {
    const AppConfig = getAppConfig();
    const app = express();

    SyncSocketIO.Config.bEnableLog = false;
    SyncSocketIO.Config.timeoutSeconds = 5;
    SyncSocketIO.Config.retryIntervalSeconds = 1;

    app.use(cors());

    app.use(
      bodyParser.urlencoded({
        extended: true,
      })
    );

    app.use(bodyParser.json());

    if (config.apiPath) {
      this.m_log.info(`api path -> "${config.apiPath}"`);
      app.post(config.apiPath, (req, res) => {
        this.m_subjectRequest.next({
          method: "post",
          request: req,
          response: res,
        });
      });
      app.get(config.apiPath, (req, res) => {
        this.m_subjectRequest.next({
          method: "get",
          request: req,
          response: res,
        });
      });
      app.post(`${config.apiPath}/client`, (req, res) => {
        this.m_subjectRequest.next({
          method: "post",
          request: req,
          response: res,
        });
      });
    } else {
      this.m_log.error("api path undefined");
    }

    if (config.debuggerPath) {
      app.post(config.debuggerPath, (req, res) => {
        this.onPostDebug(req, res);
      });
    }

    if (config.documentRoot) {
      app.use(express.static(config.documentRoot));
      this.m_log.debug(`document root -> "${config.documentRoot}"`);
    } else {
      this.m_log.error("document root undefiend");
    }

    const _port = process.env.PORT || config.port;
    const webServer = app.listen(_port, () => {
      this.m_log.info(`start listening port -> ${_port}`);
    });

    const wsServer = new socketio.Server(webServer);

    this.m_log.info("ws connection started");
    SyncSocketIO.waitForConnecting(wsServer, (s) => {
      this.m_subjectRequest.next({
        method: "socket",
        socket: s,
      });
    });
  }

  private onPostDebug(req: Request, res: Response) {
    type debugger_opt_t = {
      command:
        | "get_socket_ids"
        | "get_pending_solicited_messages"
        | "emit_unsolicited_message"
        | "emit_solicited_message"
        | "emit_solicited_response"
        | "goodbye";
      session_id?: string;
      message?: {
        event: string;
        body: any;
        index?: number;
      };
    };
    const opt = req.body as debugger_opt_t;

    let s: SyncSocketIO | undefined = undefined;
    if (opt.session_id) {
      if (opt.session_id in SyncSocketIO.Sockets) {
        s = SyncSocketIO.Sockets[opt.session_id];
      } else {
        res.status(500).send({
          status: "error",
          error: `invalid session_id ${opt.session_id}`,
        });
        return;
      }
    }

    switch (opt.command) {
      case "get_socket_ids": {
        res.status(200).send(
          Object.keys(SyncSocketIO.Sockets).map((x) => {
            return { session_id: x, tag: SyncSocketIO.Sockets[x].Tag };
          })
        );
        break;
      }

      case "get_pending_solicited_messages": {
        res.status(200).send(s!.PendingSolicitedMessages);
        break;
      }

      case "emit_unsolicited_message": {
        s!
          .emitUnsolicitedMessage(opt.message!.event, opt.message!.body)
          .then((x) => {
            res.status(200).send({
              status: "OK",
              when: "emitUnsolicitedMessage",
              send: opt.message,
            });
          })
          .catch((err) => {
            res.status(500).send({
              status: "error",
              when: "emitUnsolicitedMessage",
              error: err,
            });
          });
        break;
      }

      case "emit_solicited_message": {
        s!
          .emitSolicitedMessageAndWaitResponse(
            opt.message!.event,
            opt.message!.body
          )
          .then((x) => {
            res.status(200).send({
              status: "OK",
              when: "emitSolicitedMessageAndWaitResponse",
              send: opt.message,
              receive: x,
            });
          })
          .catch((err) => {
            res.status(500).send({
              status: "error",
              when: "emitSolicitedMessageAndWaitResponse",
              error: err,
            });
          });
        break;
      }

      case "emit_solicited_response": {
        s!
          .emitSolicitedResponse(
            opt.message!.index!,
            opt.message!.event,
            opt.message!.body
          )
          .then((x) => {
            res.status(200).send({
              status: "OK",
              when: "emitSolicitedResponse",
              send: opt.message,
            });
          })
          .catch((err) => {
            res.status(500).send({
              status: "OK",
              when: "emitSolicitedResponse",
              error: err,
            });
          });
        break;
      }

      case "goodbye": {
        s!.goodbye();
        res.status(200).send({
          status: "OK",
        });
        break;
      }
    }
  }

  public bindSockets(A: SyncSocketIO, B: SyncSocketIO) {
    this.m_log.debug(`bindSockets: "${A.SessionId}" & "${B.SessionId}"`);

    A.onSolcitedMessageRegex(".*", (index, event, body) => {
      B.emitSolicitedMessageAndWaitResponse(event, body).then((resp) => {
        A.emitSolicitedResponse(index, resp.event, resp.body);
      });
    });

    A.onUnsolicitedMessageRegex(".*", (event, body) => {
      B.emitUnsolicitedMessage(event, body);
    });

    B.onSolcitedMessageRegex(".*", (index, event, body) => {
      A.emitSolicitedMessageAndWaitResponse(event, body).then((resp) => {
        B.emitSolicitedResponse(index, resp.event, resp.body);
      });
    });

    B.onUnsolicitedMessageRegex(".*", (event, body) => {
      A.emitUnsolicitedMessage(event, body);
    });
  }
}
