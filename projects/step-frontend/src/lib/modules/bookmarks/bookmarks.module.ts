import { NgModule } from '@angular/core';
import { ViewRegistryService } from '@exense/step-core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { ManageBookmarksListComponent } from './components/manage-bookmarks-list/manage-bookmarks-list.component';
import { NoTotalCountPaginator } from '../timeseries/modules/_common';

@NgModule({
  imports: [ManageBookmarksListComponent],
  exports: [ManageBookmarksListComponent],
  providers: [{ provide: MatPaginatorIntl, useClass: NoTotalCountPaginator }],
})
export class BookmarksModule {
  constructor(_viewRegistry: ViewRegistryService) {
    _viewRegistry.registerRoute({
      path: 'bookmarks',
      component: ManageBookmarksListComponent,
    });
  }
}
