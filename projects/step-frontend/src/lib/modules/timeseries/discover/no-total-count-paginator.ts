import { MatPaginatorIntl } from '@angular/material/paginator';

export class NoTotalCountPaginator extends MatPaginatorIntl {
  constructor() {
    super();

    // If the length is higher than 999_000, it means it should be hidden
    this.getRangeLabel = (page: number, pageSize: number, length: number) => {
      if (length === 0 || pageSize === 0) {
        return ``;
      }
      length = Math.max(length, 0);
      const startIndex = page * pageSize;
      // If the start index exceeds the list length, do not try and fix the end index to the end.
      const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
      return `${startIndex + 1} – ${endIndex} ` + (length < 999_000 ? `of ${length}` : '');
    };
  }
}
