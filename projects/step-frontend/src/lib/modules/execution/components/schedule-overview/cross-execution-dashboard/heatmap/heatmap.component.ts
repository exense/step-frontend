import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  signal,
  computed,
  effect,
  viewChild,
  ElementRef,
  untracked,
  output,
  inject,
} from '@angular/core';
import { PaginatorComponent, StepPageEvent } from '@exense/step-core';
import { PageEvent } from '@angular/material/paginator';
import { HeatMapColor, HeatmapColumn, HeatMapRow } from './types/heatmap-types';
import { HeatmapPersistenceStateService } from './injectables/heatmap-persistence-state.service';

@Component({
  selector: 'step-heatmap',
  templateUrl: './heatmap.component.html',
  styleUrl: './heatmap.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
  providers: [HeatmapPersistenceStateService],
})
export class HeatmapComponent {
  private _heatmapState = inject(HeatmapPersistenceStateService);
  private defaultPage = this._heatmapState.getPage();

  readonly columns = input<HeatmapColumn[]>([]);
  readonly rows = input<HeatMapRow[]>([]);
  readonly firstColumnHeader = input<string>('Name');
  readonly emptyColor = input<string>('#dddddd');
  readonly cellSize = input<number>(80);
  readonly rowHeight = input<number>(30);
  readonly labelColWidth = input<number>(240);
  readonly enableCellLinks = input<boolean>(true);
  readonly legendColors = input<HeatMapColor[]>([]);

  protected readonly PAGE_SIZES = [10, 25, 50];
  protected readonly searchValue = signal('');

  protected readonly pageSize = signal(this.defaultPage?.pageSize ?? 10);
  protected readonly page = signal(this.defaultPage?.pageIndex ?? 0);

  private paginator = viewChild(PaginatorComponent);
  private container = viewChild('scrollableContainer', { read: ElementRef<HTMLElement> });

  readonly cellClick = output<{ row: HeatMapRow; column: HeatmapColumn }>();

  private scrollEffect = effect(() => {
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

  private searchChange = effect(() => {
    this.searchValue();
    this.paginator()?.firstPage();
  });

  protected filteredRows = computed(() => {
    const list = this.rows() ?? [];
    const q = (this.searchValue?.() ?? '').trim().toLowerCase();
    return q ? list.filter((r) => (r.label ?? '').toLowerCase().includes(q)) : list;
  });

  protected fillerRows = computed(() => {
    let pageSize = this.pageSize();
    let filteredRows = this.filteredRows();
    if (filteredRows.length < pageSize) {
      return Array(pageSize - filteredRows.length);
    } else {
      return [];
    }
  });

  protected filteredAndPaginatedRows = computed(() => {
    const filtered = this.filteredRows();
    const rawPage = this.page();
    const pageSize = this.pageSize();

    const total = filtered.length;
    const pageCount = Math.max(1, Math.ceil(total / pageSize));
    const page = Math.min(Math.max(1, rawPage + 1), pageCount); // clamp

    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return filtered.slice(start, end);
  });

  protected handleCellClick(row: HeatMapRow, column: HeatmapColumn): void {
    this.cellClick.emit({ row, column });
    const link = row.cells?.[column.id]?.link;
    if (link && this.enableCellLinks()) {
      window.open(link, '_blank');
    }
  }

  
  handlePageChange(page: StepPageEvent) {
    if (page.pageSize !== this.pageSize()) {
      page.pageIndex = 0;
    }

    this.page.set(page.pageIndex);
    this.pageSize.set(page.pageSize);
  }
}
