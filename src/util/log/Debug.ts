import { LogLike } from "./LogLike";
import debug from "debug";

class DebugImpl implements LogLike {
  private m_log: debug.Debugger;
  constructor(tag: string) {
    this.m_log = debug(tag);
  }
  debug(arg: string, ...args: any[]) {
    this.m_log("[debug] ", arg, ...args);
  }
  info(arg: string, ...args: any[]) {
    this.m_log("[info] ", arg, ...args);
  }
  warn(arg: string, ...args: any[]) {
    this.m_log("[warn] ", arg, ...args);
  }
  error(arg: string, ...args: any[]) {
    this.m_log("[error] ", arg, ...args);
  }
}

export function Debug(tag: string) {
  return new DebugImpl(tag);
}
