export abstract class GridDimensionsService {
  abstract readonly columnGap: number;
  abstract readonly rowGap: number;
  abstract readonly columnWidth: number;
  abstract readonly rowHeight: number;
  abstract determineCellsWidth(colIndex: number): number;
  abstract determineCellsHeight(rowIndex: number): number;
  abstract determineCellColumn(x: number): number;
  abstract determineCellRow(y: number): number;
}
