import { RowCorrection } from './row-correction';
import { ColumnCorrection } from './column-correction';

interface WidgetPositionParams {
  column: number;
  row: number;
  widthInCells: number;
  heightInCells: number;
}

export class WidgetPosition implements WidgetPositionParams {
  column: number;
  row: number;
  widthInCells: number;
  heightInCells: number;

  constructor(
    public readonly id: string,
    params: WidgetPositionParams,
  ) {
    this.column = params.column;
    this.row = params.row;
    this.widthInCells = params.widthInCells;
    this.heightInCells = params.heightInCells;
  }

  get leftEdge(): number {
    return this.column;
  }

  get rightEdge(): number {
    return this.column + this.widthInCells - 1;
  }

  get topEdge(): number {
    return this.row;
  }

  get bottomEdge(): number {
    return this.row + this.heightInCells - 1;
  }

  private get centerCol(): number {
    return this.column + this.widthInCells / 2;
  }

  private get centerRow(): number {
    return this.row + this.heightInCells / 2;
  }

  applyLimits(maxWidthInCells: number, maxHeightInCells?: number): void {
    if (this.row <= 0) {
      this.row = 1;
    }

    if (this.column <= 0) {
      this.column = 1;
    }

    if (this.rightEdge > maxWidthInCells) {
      const diff = Math.abs(maxWidthInCells - this.rightEdge);
      this.widthInCells -= diff;
    }

    if (maxHeightInCells !== undefined) {
      if (this.bottomEdge > maxHeightInCells) {
        const diff = Math.abs(maxHeightInCells - this.bottomEdge);
        this.heightInCells -= diff;
      }
    }
  }

  applyRowCorrection({ left, right }: RowCorrection): void {
    this.column += left;
    this.widthInCells -= right;
    if (this.widthInCells < 1) {
      this.widthInCells = 1;
    }
  }

  applyColumnCorrection({ top, bottom }: ColumnCorrection): void {
    this.row += top;
    this.heightInCells -= bottom;
    if (this.heightInCells < 1) {
      this.heightInCells = 1;
    }
  }

  clone(): WidgetPosition {
    return new WidgetPosition(this.id, this);
  }

  distance(pos: WidgetPosition): number {
    const x = Math.abs(this.centerCol - pos.centerCol);
    const y = Math.abs(this.centerRow - pos.centerRow);
    return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
  }

  logPosition(prefix: string): void {
    console.log(
      'POSITION',
      prefix,
      'COL:',
      this.column,
      'ROW:',
      this.row,
      'WIDTH:',
      this.widthInCells,
      'HEIGHT:',
      this.heightInCells,
      'RIGHT:',
      this.rightEdge,
      'BOTTOM:',
      this.bottomEdge,
    );
  }
}
