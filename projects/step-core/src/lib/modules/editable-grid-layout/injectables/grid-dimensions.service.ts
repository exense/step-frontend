export abstract class GridDimensionsService {
  abstract readonly COL_COUNT: number;
  abstract readonly columnGap: number;
  abstract readonly rowGap: number;
  abstract determineCellsWidth(colIndex: number): number;
  abstract determineCellsHeight(rowIndex: number): number;
  abstract determineCellColumn(x: number): number;
  abstract determineCellRow(y: number): number;
}
