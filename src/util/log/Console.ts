import { LogLike } from "./LogLike";

class ConsoleImp implements LogLike {
  debug(arg: string, ...args: any[]) {
    console.debug(arg, ...args);
  }
  info(arg: string, ...args: any[]) {
    console.info(arg, ...args);
  }
  warn(arg: string, ...args: any[]) {
    console.warn(arg, ...args);
  }
  error(arg: string, ...args: any[]) {
    console.error(arg, ...args);
  }
}

export const Console = new ConsoleImp();
