import { IPromise } from 'angular';
import { from, Observable } from 'rxjs';

export const a1Promise2Promise = <T>(promise: IPromise<T>): Promise<T> =>
  Promise.resolve(promise as unknown as Promise<T>);

export const a1Promise2Observable = <T>(promise: IPromise<T>): Observable<T> => {
  const pr = a1Promise2Promise(promise);
  return from(pr);
};

export const isChildOf = ({ parent, searchElement }: { parent: HTMLElement; searchElement: HTMLElement }): boolean => {
  let currentElement: HTMLElement | null = searchElement;

  while (currentElement) {
    currentElement = currentElement.parentElement;

    if (currentElement === parent) {
      return true;
    }
  }

  return false;
};
