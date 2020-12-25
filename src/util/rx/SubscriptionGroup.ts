import { Subscription, Observable } from "rxjs";
import { LogLike } from "../log";

export class SubscriptionGroup {
  private m_subscriptions: Subscription[] = [];
  private static s_subscriptionIndex = 0;
  private m_log: LogLike;

  public constructor(log: LogLike) {
    this.m_log = log;
  }

  public append(s: string, o: Observable<unknown>) {
    SubscriptionGroup.s_subscriptionIndex++;
    const index = SubscriptionGroup.s_subscriptionIndex;
    this.m_subscriptions.push(
      o.subscribe(
        (j) => {
          this.m_log.debug(`[${s}:#${index}] on next`, j);
        },
        (err) => {
          this.m_log.error(`[${s}:#${index}] on error`, err);
        },
        () => {
          this.m_log.debug(`[${s}:#${index}] on complete`);
        }
      )
    );
  }

  public unsubscribeAll() {
    this.m_subscriptions.forEach((x) => {
      x.unsubscribe();
    });
    this.m_subscriptions = [];
  }
}
