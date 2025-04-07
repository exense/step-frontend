import { InjectionToken } from '@angular/core';

export const TREE_SEARCH_DESCRIPTION = new InjectionToken<string>('Tree search description', {
  providedIn: 'root',
  factory: () =>
    'The search is performed on the raw-data. This means configurations are found by there ID instead the rendered labels shown in the tree. This may lead to false-positives or false-negative search results.',
});
