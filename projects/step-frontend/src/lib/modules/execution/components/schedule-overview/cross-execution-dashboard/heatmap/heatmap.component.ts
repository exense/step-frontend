import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  ViewEncapsulation,
  input,
  signal,
  computed,
} from '@angular/core';
import { Execution } from '@exense/step-core';

export interface HeatmapColumn {
  id: string;
  label?: string;
}

export interface HeatMapRow {
  label: string;
  cells: Record<string, HeatMapCell>;
}

export interface HeatMapCell {
  color: string;
  link?: string;
  timestamp: number;
  statusesCount: Record<string, number>;
}

export interface HeatMapColor {
  hex: string;
  label: string;
}

@Component({
  selector: 'step-heatmap',
  templateUrl: './heatmap.component.html',
  styleUrl: './heatmap.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class HeatmapComponent {
  // === Inputs as signals ===
  readonly columns = input<HeatmapColumn[]>([]);
  readonly rows = input<HeatMapRow[]>([]);
  readonly firstColumnHeader = input<string>('Name');
  readonly emptyColor = input<string>('#dddddd');
  readonly cellSize = input<number>(80);
  readonly rowHeight = input<number>(30);
  readonly labelColWidth = input<number>(240);
  readonly enableCellLinks = input<boolean>(true);
  readonly legendColors = input<HeatMapColor[]>([]);

  readonly searchValue = signal('');

  /** Emitted on any cell click. */
  @Output() cellClick = new EventEmitter<{ row: HeatMapRow; column: HeatmapColumn }>();

  filteredRows = computed(() => {
    const list = this.rows() ?? [];
    const q = (this.searchValue?.() ?? '').trim().toLowerCase();
    if (!q) return list;

    return list.filter((r) => (r.label ?? '').toLowerCase().includes(q));
  });

  trackByColumn = (_: number, c: HeatmapColumn) => c.id;
  trackByRow = (_: number, r: HeatMapRow) => r.label;

  onCellClick(row: HeatMapRow, column: HeatmapColumn): void {
    this.cellClick.emit({ row, column });
    const link = row.cells?.[column.id]?.link;
    if (link && this.enableCellLinks()) {
      window.open(link, '_blank');
    }
  }

  handleSearchValueChange(newValue: string) {
    this.searchValue.set(newValue);
  }
}
