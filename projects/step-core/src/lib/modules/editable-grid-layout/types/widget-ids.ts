export class WidgetIDs {
  private widgetIdsNumStr = new Map<number, string>();
  private widgetIdsStrNum = new Map<string, number>();

  constructor(widgetKeys: string[]) {
    widgetKeys.forEach((idStr, index) => {
      const idNum = index + 1;
      this.widgetIdsNumStr.set(idNum, idStr);
      this.widgetIdsStrNum.set(idStr, idNum);
    });
  }

  destroy(): void {
    this.widgetIdsNumStr.clear();
    this.widgetIdsStrNum.clear();
  }

  getNumericIdByString(idString: string): number {
    return this.widgetIdsStrNum.get(idString) ?? -1;
  }

  getStringIdByNumber(idNumber: number): string {
    return this.widgetIdsNumStr.get(idNumber) ?? '';
  }
}
