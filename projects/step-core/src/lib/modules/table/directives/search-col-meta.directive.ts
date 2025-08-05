import { Directive, forwardRef, Input } from '@angular/core';
import { SearchColumn } from '../shared/search-column.interface';
import { SearchColBase } from './search-col-base';
import { SearchColumnAccessor } from '../shared/search-column-accessor';

@Directive({
  selector: '[stepSearchColMeta]',
  providers: [
    {
      provide: SearchColumnAccessor,
      useExisting: forwardRef(() => SearchColMetaDirective),
    },
  ],
  standalone: false,
})
export class SearchColMetaDirective extends SearchColBase implements SearchColumnAccessor {
  @Input('stepSearchColMeta') meta?: SearchColumn;

  get searchColumnName(): string {
    return this.meta?.searchName ?? '';
  }
}
