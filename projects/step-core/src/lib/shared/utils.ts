import { AbstractControl, FormArray, FormControl, FormGroup } from '@angular/forms';
import { IPromise } from 'angular';
import { Observable, from } from 'rxjs';
import { DynamicValueInteger, DynamicValueString } from '../client/generated';
import { AceMode } from './ace-mode.enum';
import { Collection } from './collection.interface';
import { ScriptLanguage } from './script-language.enum';
import { KeyValue } from '@angular/common';
import { Route } from '@angular/router';
import { SUB_ROUTE_DATA } from './constants';

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
    const container = res as Record<string, unknown>;

    container[fieldName] = index < pathParts.length - 1 ? container[fieldName] ?? {} : value;

    return container[fieldName];
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

export const convertScriptLanguageToAce = (scriptLanguage?: ScriptLanguage): AceMode | undefined => {
  return !scriptLanguage ? undefined : (AceMode as any)[scriptLanguage];
};

export const dynamicValueFactory = () => ({
  createDynamicValueString(dynamicValueString?: Partial<DynamicValueString>): DynamicValueString {
    return {
      dynamic: dynamicValueString?.dynamic ?? false,
      expression: dynamicValueString?.expression ?? '',
      expressionType: dynamicValueString?.expressionType ?? '',
      value: dynamicValueString?.value ?? '',
    };
  },
  createDynamicValueInteger(dynamicValueInteger?: Partial<DynamicValueInteger>): DynamicValueInteger {
    return {
      dynamic: dynamicValueInteger?.dynamic ?? false,
      expression: dynamicValueInteger?.expression ?? '',
      expressionType: dynamicValueInteger?.expressionType ?? '',
      value: dynamicValueInteger?.value ?? 0,
    };
  },
});

export const toKeyValuePairs = <T>(object: Record<string, T>): KeyValue<string, T>[] =>
  Object.entries(object).map(([key, value]) => ({
    key,
    value,
  }));

export const toRecord = <T>(keyValuePairs: KeyValue<string, T>[]): Record<string, T> =>
  keyValuePairs.reduce(
    (acc, { key, value }) => ({
      ...acc,
      [key]: value,
    }),
    {}
  );

export const routesPrioritySortPredicate = (routeA: Route, routeB: Route) => {
  const weightA = routeA.data?.[SUB_ROUTE_DATA]?.weight ?? 1;
  const weightB = routeB.data?.[SUB_ROUTE_DATA]?.weight ?? 1;
  return weightA - weightB;
};
