import { Injectable } from '@angular/core';
import { DateTime } from 'luxon';
import { FilterCondition } from '../shared/filter-condition';
import { SingleDateFilterCondition } from '../shared/single-date-filter-condition';

@Injectable({
  providedIn: 'root',
})
export class FilterConditionFactoryService {
  singleDateFilterCondition(date?: DateTime): FilterCondition {
    return new SingleDateFilterCondition(date);
  }
}
