export abstract class TableColumnsMove {
  abstract moveColumn(column: string, placeRelativeToColumn: string, placePosition: 'left' | 'right'): void;
}
