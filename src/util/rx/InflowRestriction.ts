import {
  asyncScheduler,
  BehaviorSubject,
  NEVER,
  Observable,
  Subject,
  throwError,
} from "rxjs";
import { catchError, map, mergeMap, observeOn, take } from "rxjs/operators";
import { readySetGo } from "./rx";
import { LogLike } from "../log";

type status_t = {
  waitings: number;
  runnings: number;
  total: number;
};

export class InflowRestriction {
  private m_caller = new Subject<number>();
  private m_queue: number[] = [];
  private m_running: number[] = [];
  private m_runnerId = 0;
  private m_limit: number;
  private m_log: LogLike;

  private m_status = new BehaviorSubject<status_t>({
    waitings: 0,
    runnings: 0,
    total: 0,
  });

  public constructor(limit: number, log: LogLike) {
    this.m_limit = limit;
    this.m_log = log;
  }

  private emitStatus(memo: string) {
    const status: status_t = {
      waitings: this.m_queue.length,
      runnings: this.m_running.length,
      total: this.m_runnerId,
    };
    this.m_log.debug(`InflowRestriction.emitStatus ${memo}: `, status);
    this.m_status.next(status);
  }

  public get Status() {
    return this.m_status.asObservable();
  }

  public reset() {
    this.m_log.debug("InflowRestriction.reset");
    this.m_caller.complete();
    this.m_caller = new Subject<number>();
    this.m_queue = [];
    this.m_running = [];
    this.m_runnerId = 0;
    this.emitStatus("reset()");
  }

  private checkIn(memo: string, id: number) {
    this.m_log.debug(`InflowRestriction.checkOut ${memo}`);
    if (this.m_running.length > this.m_limit) {
      this.m_queue.push(id);
    } else {
      this.m_running.push(id);
      this.m_caller.next(id);
    }
    this.emitStatus(memo);
  }

  private checkOut(memo: string, id: number) {
    this.m_log.debug(`InflowRestriction.checkOut ${memo}`);
    this.m_running = this.m_running.filter((x) => x !== id);
    const next = this.m_queue.shift();
    if (next !== undefined) {
      this.m_running.push(next);
      this.m_caller.next(next);
    }
    this.emitStatus(memo);
  }

  public enter<T>(memo: string, func: () => Observable<T>): Observable<T> {
    const id = ++this.m_runnerId;
    const _memo = `(${id}) ${memo}`;
    this.m_log.info(`InflowRestriction start ${_memo}`);
    return readySetGo(() => {
      this.checkIn(_memo, id);
    }, this.m_caller)
      .pipe(observeOn(asyncScheduler))
      .pipe(
        mergeMap((x) => {
          if (x !== id) return NEVER;
          return func();
        })
      )
      .pipe(take(1))
      .pipe(
        catchError((err) => {
          this.m_log.error(`InflowRestriction error  ${_memo}: ${err}`);
          this.checkOut(_memo, id);
          return throwError(err);
        })
      )
      .pipe(
        map((x) => {
          this.checkOut(_memo, id);
          this.m_log.info(`InflowRestriction finish ${_memo}`);
          return x;
        })
      );
  }
}
