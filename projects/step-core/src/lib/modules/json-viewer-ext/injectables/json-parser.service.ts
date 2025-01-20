import { Injectable } from '@angular/core';
import { JsonNode } from '../types/json-node';

enum ParentType {
  OBJECT,
  ARRAY,
}

@Injectable({
  providedIn: 'root',
})
export class JsonParserService {
  parse(json: Record<string, unknown>): JsonNode[] {
    const result: JsonNode[] = [];
    const nodesToProceed = Object.entries(json) as ([string, unknown] | null)[];
    const parentStack: ParentType[] = [];
    let level = 0;
    while (nodesToProceed.length) {
      const node = nodesToProceed.shift();

      if (!node) {
        const parentType = parentStack.pop();
        const lastNode = result[result.length - 1];
        if (lastNode) {
          lastNode.suffix = lastNode.suffix ?? '';
          switch (parentType) {
            case ParentType.ARRAY:
              lastNode.suffix += ']';
              break;
            case ParentType.OBJECT:
              lastNode.suffix += '}';
              break;
          }
        }
        level--;
        continue;
      }
      const [name, value] = node!;
      let parentType: ParentType | undefined = undefined;
      let nextNodes: ([string, unknown] | null)[] | undefined = undefined;
      if (value instanceof Array) {
        nextNodes = value!.map((item) => ['', item] as [string, unknown]);
        parentType = ParentType.ARRAY;
      } else if (typeof value === 'object') {
        nextNodes = Object.entries(value!) as [string, unknown][];
        parentType = ParentType.OBJECT;
      }
      const jsonNode: JsonNode = {
        id: result.length + 1,
        name,
        level: parentStack.length,
        value: !!nextNodes?.length ? undefined : (value as string | number | boolean),
      };
      const previousNode = result[result.length - 1];
      if (previousNode && level > previousNode.level) {
        const parentType = parentStack[parentStack.length - 1];
        switch (parentType) {
          case ParentType.ARRAY:
            jsonNode.prefix = '[';
            break;
          case ParentType.OBJECT:
            jsonNode.prefix = '{';
            break;
        }
      }

      result.push(jsonNode);
      if (!!nextNodes?.length) {
        nodesToProceed.unshift(...nextNodes, null);
        parentStack.push(parentType!);
        level++;
      }
    }
    return result;
  }
}
