export interface WidgetPositionParams {
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

  includesPoint(row: number, column: number): boolean {
    return row >= this.topEdge && row <= this.bottomEdge && column >= this.leftEdge && column <= this.rightEdge;
  }

  clone(): WidgetPosition {
    return new WidgetPosition(this.id, this);
  }
}
