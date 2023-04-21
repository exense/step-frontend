import { Observable } from 'rxjs';

export const resizeObservable = (element: HTMLElement) =>
  new Observable<ResizeObserverEntry[]>((subscriber) => {
    const resizeObserver = new ResizeObserver((entries) => subscriber.next(entries));
    resizeObserver.observe(element);
    const unsubscribe = () => resizeObserver.unobserve(element);
    return unsubscribe;
  });
