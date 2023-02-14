import { IPromise } from 'angular';
import { from, Observable } from 'rxjs';
import { Collection } from './collection.interface';

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

/**
 * The time complexity of a Breadth-First Search (BFS) algorithm is O(|V| + |E|),
 * where |V| is the number of vertices and |E| is the number of edges in the graph being traversed.
 * The reason for this is that in the worst-case scenario, BFS needs to visit all vertices and all edges.
 */
export const breadthFirstSearch = <T>({
  items,
  predicate = Boolean,
  children,
}: {
  items: Collection<T>;
  predicate?: (item: T) => boolean;
  children: (item: T) => T[];
}) => {
  if (!items.length) {
    return [];
  }

  const filtered: T[] = [];
  const queue: T[] = [...items];
  const visited = new Set<T>();

  while (queue.length) {
    const item = queue.shift() as T;

    visited.add(item);

    if (predicate(item)) {
      filtered.push(item);
    }

    const nonVisitedChildren = children(item).filter((child) => !visited.has(child));

    queue.push(...nonVisitedChildren);
  }

  return filtered;
};
