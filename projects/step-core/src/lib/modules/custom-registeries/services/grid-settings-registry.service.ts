import { Injectable } from '@angular/core';

export interface GridElementInfo {
  id: string;
  title: string;
  weight: number;
  widthInCells: number;
  heightInCells: number;
}

@Injectable({
  providedIn: 'root',
})
export class GridSettingsRegistryService {
  private girdsSettings: Map<string, GridElementInfo[]> = new Map();

  register(gridId: string, gridElement: GridElementInfo): void {
    if (!this.girdsSettings.has(gridId)) {
      this.girdsSettings.set(gridId, []);
    }
    this.girdsSettings.get(gridId)!.push(gridElement);
  }

  getSettings(gridId: string): ReadonlyArray<GridElementInfo> {
    return (this.girdsSettings.get(gridId) ?? []).map((item) => ({ ...item }));
  }
}
