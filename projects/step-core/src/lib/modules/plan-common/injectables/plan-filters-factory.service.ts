import { Injectable } from '@angular/core';
import { PlanFilter } from '../../../client/step-client-module';
import { PlanByIncludedNamesFilter } from '../types/plan-by-included-names-filter';
import { PlanByExcludedNamesFilter } from '../types/plan-by-excluded-names-filter';
import { PlanByIncludedCategoriesFilter } from '../types/plan-by-included-categories-filter';
import { PlanByExcludeCategoriesFilter } from '../types/plan-by-excluded-categories-filter';
import { PlanMultiFilter } from '../types/plan-multi-filter';

@Injectable({
  providedIn: 'root',
})
export class PlanFiltersFactoryService {
  byIncludedNames(names: string[]): PlanFilter {
    return new PlanByIncludedNamesFilter(names);
  }

  byExcludedNames(names: string[]): PlanFilter {
    return new PlanByExcludedNamesFilter(names);
  }

  byIncludedCategories(categories: string[]): PlanFilter {
    return new PlanByIncludedCategoriesFilter(categories);
  }

  byExcludedCategories(categories: string[]): PlanFilter {
    return new PlanByExcludeCategoriesFilter(categories);
  }

  byMultipleFilters(filters: PlanFilter[]): PlanFilter {
    return new PlanMultiFilter(filters);
  }
}
