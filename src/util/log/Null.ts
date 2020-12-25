import { LogLike } from "./LogLike";

class NullImpl implements LogLike {
  debug(arg: string, ...args: any[]) {}
  info(arg: string, ...args: any[]) {}
  warn(arg: string, ...args: any[]) {}
  error(arg: string, ...args: any[]) {}
}

export const Null = new NullImpl();
