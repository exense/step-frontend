import { ContentChild, Directive, forwardRef, Input } from '@angular/core';
import { BaseFilterComponent } from '../../basics/step-basics.module';
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
})
export class SearchColMetaDirective extends SearchColBase implements SearchColumnAccessor {
  @Input('stepSearchColMeta') meta?: SearchColumn;

  @ContentChild(BaseFilterComponent, { static: false })
  cFilter: any;

  get searchColumnName(): string {
    return this.meta?.searchName ?? '';
  }
}
