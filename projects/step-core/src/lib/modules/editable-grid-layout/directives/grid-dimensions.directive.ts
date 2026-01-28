import { computed, Directive, ElementRef, forwardRef, inject, untracked } from '@angular/core';
import { ElementSizeDirective } from '../../basics/step-basics.module';
import { DOCUMENT } from '@angular/common';
import { GridDimensionsService } from '../injectables/grid-dimensions.service';

@Directive({
  selector: '[stepGridDimensions]',
  hostDirectives: [ElementSizeDirective],
  providers: [
    {
      provide: GridDimensionsService,
      useExisting: forwardRef(() => GridDimensionsDirective),
    },
  ],
})
export class GridDimensionsDirective implements GridDimensionsService {
  private _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private _elementSize = inject(ElementSizeDirective, { self: true });
  private _doc = inject(DOCUMENT);

  readonly COL_COUNT = 8;

  private readonly gridStyles = computed(() => {
    const width = this._elementSize.width();
    return this._doc?.defaultView?.getComputedStyle(this._elementRef.nativeElement);
  });

  private readonly gridDimensions = computed(() => {
    const gridStyles = this.gridStyles();
    const columnGapStr = gridStyles?.['columnGap'] ?? '';
    let columnGap = parseFloat(columnGapStr);
    columnGap = isNaN(columnGap) ? 0 : columnGap;

    const rowGapStr = gridStyles?.['rowGap'] ?? '';
    let rowGap = parseFloat(rowGapStr);
    rowGap = isNaN(rowGap) ? 0 : rowGap;

    const templateColumns = gridStyles?.['gridTemplateColumns'];
    const colWidthStr = templateColumns?.split?.(' ')?.[0] ?? '';
    let colWidth = parseFloat(colWidthStr);
    colWidth = isNaN(colWidth) ? 0 : colWidth;

    const templateRows = gridStyles?.['gridTemplateRows'];
    const rowHeightStr = templateRows?.split?.(' ')?.[0] ?? '';
    let rowHeight = parseFloat(rowHeightStr);
    rowHeight = isNaN(rowHeight) ? 0 : rowHeight;
    return {
      columnGap,
      rowGap,
      colWidth,
      rowHeight,
    };
  });

  get columnGap(): number {
    return untracked(() => this.gridDimensions()).columnGap;
  }

  get rowGap(): number {
    return untracked(() => this.gridDimensions()).rowGap;
  }

  determineCellsWidth(colIndex: number): number {
    const { colWidth, columnGap } = untracked(() => this.gridDimensions());
    const size = colWidth + columnGap;
    return colIndex * size;
  }

  determineCellsHeight(rowIndex: number): number {
    const { rowHeight, rowGap } = untracked(() => this.gridDimensions());
    const size = rowHeight + rowGap;
    return rowIndex * size;
  }

  determineCellColumn(x: number): number {
    const { colWidth, columnGap } = untracked(() => this.gridDimensions());
    const size = colWidth + columnGap;
    let col = Math.floor(x / size);
    if (x % size !== 0) {
      col++;
    }
    return col;
  }

  determineCellRow(y: number): number {
    const { rowHeight, rowGap } = untracked(() => this.gridDimensions());
    const size = rowHeight + rowGap;
    let row = Math.floor(y / size);
    if (y % size !== 0) {
      row++;
    }
    return row;
  }
}
