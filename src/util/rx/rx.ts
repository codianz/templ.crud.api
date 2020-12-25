import { Observable, Observer } from "rxjs";
import { tap } from "rxjs/operators";
import { LogLike } from "../log";
import { anyToString, errorToString } from "../string";

let log_index = 0;

export function doSubscribe(log: LogLike, s: string, o: Observable<unknown>) {
  const index = ++log_index;

  log.debug(`[${s}:#${index}] start subscribe`);
  o.subscribe(
    (j) => {
      log.debug(`[${s}:#${index}] on next\n${anyToString(j)}`);
    },
    (err) => {
      log.debug(`[${s}:#${index}] on error\n${errorToString(err)}`);
    },
    () => {
      log.debug(`[${s}:#${index}] on completed`);
    }
  );
}

export function readySetGo<T>(ready: () => void, observable: Observable<T>) {
  return ObservableFactory<T>((observer) => {
    observable.subscribe(
      (v) => {
        observer.next(v);
      },
      (err) => {
        observer.error(err);
      },
      () => {
        observer.complete();
      }
    );
    ready();
  });
}

let peep_index = 0;

export function peep<T>(log: LogLike, s: string) {
  const index = ++peep_index;
  return tap<T>(
    (j) => {
      log.debug(`[${s}:#${index}] on next\n${anyToString(j)}`);
    },
    (err) => {
      log.debug(`[${s}:#${index}] on error\n${errorToString(err)}`);
    },
    () => {
      log.debug(`[${s}:#${index}] on completed`);
    }
  );
}

export function ObservableFactory<T>(
  subscribe?: (observer: Observer<T>) => void
): Observable<T> {
  return new Observable<T>(subscribe);
}
