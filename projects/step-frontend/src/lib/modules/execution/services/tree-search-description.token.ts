import { InjectionToken } from '@angular/core';

export const TREE_SEARCH_DESCRIPTION = new InjectionToken<string>('Tree search description', {
  providedIn: 'root',
  factory: () =>
    'Search is performed on the raw data. As a result, configurations are matched by their IDs rather than the labels shown in the tree. This may lead to search results that differ from what is displayed, including occasional false positives or missed matches.',
});
