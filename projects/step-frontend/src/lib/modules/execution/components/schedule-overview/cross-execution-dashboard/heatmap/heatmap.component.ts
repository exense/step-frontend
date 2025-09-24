import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  ViewEncapsulation,
  input,
  signal,
  computed,
  effect,
  viewChild,
  ElementRef,
  untracked,
} from '@angular/core';
import { Execution, PaginatorComponent } from '@exense/step-core';
import { PageEvent } from '@angular/material/paginator';
import { HeatMapColor, HeatmapColumn, HeatMapRow } from './types/heatmap-types';

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
  readonly pageSize = signal(10);
  readonly page = signal(0);

  readonly paginator = viewChild(PaginatorComponent);
  readonly container = viewChild('scrollableContainer', { read: ElementRef<HTMLElement> });

  @Output() cellClick = new EventEmitter<{ row: HeatMapRow; column: HeatmapColumn }>();

  scrollEffect = effect(() => {
    const rows = this.rows();
    const element = this.container()?.nativeElement!;
    if (rows.length > 0) {
      setTimeout(() => {
        element?.scrollTo({
          left: element.scrollWidth,
          behavior: 'auto',
        });
      }, 200);
    } else {
      element?.scrollTo({
        left: 0,
        behavior: 'auto',
      });
    }
    untracked(() => this.paginator()?.firstPage());
  });

  searchChange = effect(() => {
    this.searchValue();
    this.paginator()?.firstPage();
  });

  filteredRows = computed(() => {
    const list = this.rows() ?? [];
    const q = (this.searchValue?.() ?? '').trim().toLowerCase();
    return q ? list.filter((r) => (r.label ?? '').toLowerCase().includes(q)) : list;
  });

  fillerRows = computed(() => {
    let pageSize = this.pageSize();
    let filteredRows = this.filteredRows();
    if (filteredRows.length < pageSize) {
      return Array(pageSize - filteredRows.length);
    } else {
      return [];
    }
  });

  filteredAndPaginatedRows = computed(() => {
    const filtered = this.filteredRows();
    const rawPage = this.page();
    const rawPageSize = this.pageSize();

    const pageSize = Math.max(1, rawPageSize); // never 0
    const total = filtered.length;
    const pageCount = Math.max(1, Math.ceil(total / pageSize));
    const page = Math.min(Math.max(1, rawPage + 1), pageCount); // clamp

    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return filtered.slice(start, end);
  });

  onCellClick(row: HeatMapRow, column: HeatmapColumn): void {
    this.cellClick.emit({ row, column });
    const link = row.cells?.[column.id]?.link;
    if (link && this.enableCellLinks()) {
      window.open(link, '_blank');
    }
  }

  handlePageChange(page: PageEvent) {
    this.page.set(page.pageIndex);
  }

  handlePageSizeChange(size: number) {
    this.pageSize.set(size);
    this.paginator()?.firstPage();
  }
}
