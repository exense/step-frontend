import { IPromise } from 'angular';
import { from, Observable } from 'rxjs';

export const a1Promise2Promise = <T>(promise: IPromise<T>): Promise<T> =>
  Promise.resolve(promise as unknown as Promise<T>);

export const a1Promise2Observable = <T>(promise: IPromise<T>): Observable<T> => {
  const pr = a1Promise2Promise(promise);
  return from(pr);
};

export const getObjectFieldValue = (object: Record<string, unknown>, fieldPath: string): unknown => {
  const pathParts = fieldPath.split('.');

  return pathParts.reduce((res: Record<string, unknown> | unknown, fieldName: string) => {
    if (typeof res !== 'object' || res === null || res === undefined) {
      return res;
    }

    return (res as Record<string, unknown>)[fieldName];
  }, object);
};

export const setObjectFieldValue = (object: Record<string, unknown>, fieldPath: string, value: unknown): void => {
  const pathParts = fieldPath.split('.');

  pathParts.reduce((res: Record<string, unknown> | unknown, fieldName: string, index) => {
    if (typeof res !== 'object' || res === null || res === undefined) {
      return;
    }

    if (index === pathParts.length - 1) {
      (res as Record<string, unknown>)[fieldName] = value;
      return;
    }

    return (res as Record<string, unknown>)[fieldName];
  }, object);
};
