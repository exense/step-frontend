export interface JsonParserIconDictionaryConfigItem {
  key: string;
  icon: string;
  tooltip?: string;
  levels?: number | number[];
}

export type IconInfo = Pick<JsonParserIconDictionaryConfigItem, 'icon' | 'tooltip'>;

export type JsonParserIconDictionaryConfig = JsonParserIconDictionaryConfigItem[];

export class JsonParserIconDictionary {
  private items = new Map<string, IconInfo>();

  constructor(config?: JsonParserIconDictionaryConfig) {
    this.fillItems(config);
  }

  private fillItems(configItems: JsonParserIconDictionaryConfigItem[] = []): void {
    for (const configItem of configItems) {
      let levels: number[] = [];
      if (configItem.levels !== undefined) {
        levels = configItem.levels instanceof Array ? configItem.levels : [configItem.levels];
      }

      const { icon, tooltip } = configItem;

      if (!levels.length) {
        this.items.set(configItem.key, { icon, tooltip });
      }

      for (const level of levels) {
        const key = `${configItem.key}|${level}`;
        this.items.set(key, { icon, tooltip });
      }
    }
  }

  getNodeIcon(key: string, level: number): IconInfo | undefined {
    const global = '*';

    if (this.items.has(global)) {
      return this.items.get(global);
    }

    const globalLevel = `${global}|${level}`;
    if (this.items.has(globalLevel)) {
      return this.items.get(globalLevel);
    }

    if (this.items.has(key)) {
      return this.items.get(key);
    }

    const keyLevel = `${key}|${level}`;
    if (this.items.has(keyLevel)) {
      return this.items.get(keyLevel);
    }

    return undefined;
  }
}
