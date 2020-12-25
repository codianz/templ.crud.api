export interface LogLike {
  debug: (arg: string, ...args: any[]) => void;
  info: (arg: string, ...args: any[]) => void;
  warn: (arg: string, ...args: any[]) => void;
  error: (arg: string, ...args: any[]) => void;
}
