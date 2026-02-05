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
  private girdSettings: Map<string, GridElementInfo[]> = new Map();

  register(gridId: string, gridElement: GridElementInfo): void {
    if (!this.girdSettings.has(gridId)) {
      this.girdSettings.set(gridId, []);
    }
    this.girdSettings.get(gridId)!.push(gridElement);
  }

  getSettings(gridId: string): ReadonlyArray<GridElementInfo> {
    return (this.girdSettings.get(gridId) ?? []).map((item) => ({ ...item }));
  }
}
