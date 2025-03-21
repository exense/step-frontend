import { Injectable } from '@angular/core';
import { ArrayItemLabelValueDefaultExtractorService } from '../../basics/step-basics.module';
import { MultiLevelArrayItemLabelValueExtractor } from '../types/multi-level-array-item-label-value-extractor';

@Injectable({
  providedIn: 'root',
})
export class MultiLevelArrayItemLabelValueDefaultExtractorService<T = unknown, V = unknown>
  extends ArrayItemLabelValueDefaultExtractorService<T, V>
  implements MultiLevelArrayItemLabelValueExtractor<T, V>
{
  getChildren(item?: T): T[] {
    return (item as { children?: T[] })?.children ?? [];
  }
}
