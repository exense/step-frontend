import { WidgetPosition } from './widget-position';

export class WidgetIDs {
  private widgetIdsNumStr = new Map<number, string>();
  private widgetIdsStrNum = new Map<string, number>();
  private widgetIdTypes = new Map<string, string>();
  private widgetTypesIds = new Map<string, string[]>();

  private allWidgetTypes: Set<string>;
  private usedNumber: number = 0;

  constructor(widgetTypes: string[]) {
    this.allWidgetTypes = new Set(widgetTypes);
  }

  destroy(): void {
    this.allWidgetTypes.clear();
    this.widgetIdsNumStr.clear();
    this.widgetIdsStrNum.clear();

    this.widgetIdTypes.clear();
    this.widgetTypesIds.clear();
  }

  getNumericId(position: WidgetPosition): number {
    if (!this.widgetIdsStrNum.has(position.id)) {
      this.defineWidgetId(position.widgetType, position.id);
    }
    return this.widgetIdsStrNum.get(position.id) ?? -1;
  }

  getNumericIdsByType(widgetType: string): number[] {
    return (this.widgetTypesIds.get(widgetType) ?? [])
      .map((idString) => this.widgetIdsStrNum.get(idString))
      .filter((idNum) => idNum !== null && idNum !== undefined);
  }

  getWidgetType(widgetIdStr: string): string {
    return this.widgetIdTypes.get(widgetIdStr) ?? '';
  }

  getStringIdByNumber(idNumber: number): string {
    return this.widgetIdsNumStr.get(idNumber) ?? '';
  }

  private defineWidgetId(widgetType: string, widgetId: string): void {
    if (!this.allWidgetTypes.has(widgetType)) {
      return;
    }
    const idNum = ++this.usedNumber;
    this.widgetIdsNumStr.set(idNum, widgetId);
    this.widgetIdsStrNum.set(widgetId, idNum);
    this.widgetIdTypes.set(widgetId, widgetType);
    if (!this.widgetTypesIds.has(widgetType)) {
      this.widgetTypesIds.set(widgetType, [widgetId]);
    } else {
      this.widgetTypesIds.get(widgetType)!.push(widgetId);
    }
  }
}
