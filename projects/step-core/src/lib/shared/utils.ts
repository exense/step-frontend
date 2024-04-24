import { DynamicValueInteger, DynamicValueString } from '../client/generated';
import { Collection } from './collection.interface';
import { ScriptLanguage } from './script-language.enum';
import { KeyValue } from '@angular/common';
import { AceMode } from '../modules/rich-editor';

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
  return !scriptLanguage ? undefined : (AceMode as any)[scriptLanguage.toUpperCase()];
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
    {},
  );
