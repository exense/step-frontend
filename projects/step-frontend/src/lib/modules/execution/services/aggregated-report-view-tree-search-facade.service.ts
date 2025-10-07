import { computed, inject, Injectable, signal } from '@angular/core';
import { AggregatedReportViewTreeStateService } from './aggregated-report-view-tree-state.service';
import { ERROR_STATUSES } from '../../_common/shared/status.enum';

const ERROR_STATUSES_DISPLAY_VALUE = ERROR_STATUSES.join(', ');

@Injectable()
export class AggregatedReportViewTreeSearchFacadeService {
  private _treeState = inject(AggregatedReportViewTreeStateService);

  readonly searchCtrl = this._treeState.searchCtrl;

  readonly foundItems = computed(() => this._treeState.searchResult().length);
  readonly pageIndex = signal(0);

  readonly isErrorSearchActive = computed(() => {
    const searchForErrorsOnly = this._treeState.searchForErrorsOnly();
    const searchForErrorCause = this._treeState.searchForErrorCause();
    return searchForErrorsOnly || searchForErrorCause;
  });

  readonly errorsSearchHint = computed(() => {
    const searchForErrorsOnly = this._treeState.searchForErrorsOnly();
    const searchForErrorCause = this._treeState.searchForErrorCause();
    const rootCause = this._treeState.errorLeafsRootName();
    if (searchForErrorsOnly) {
      return `Nodes with statuses: ${ERROR_STATUSES_DISPLAY_VALUE}`;
    }
    if (searchForErrorCause) {
      return `Errors of ${rootCause}`;
    }
    return undefined;
  });

  toggleIsErrorSearchActive(): void {
    const searchForErrorsOnly = this._treeState.searchForErrorsOnly();
    const searchForErrorCause = this._treeState.searchForErrorCause();

    if (!searchForErrorsOnly && !searchForErrorCause) {
      this._treeState.toggleErrorSearch();
    } else if (searchForErrorsOnly) {
      this._treeState.toggleErrorSearch();
    } else if (searchForErrorCause) {
      this._treeState.clearErrorLeafs();
    }
  }
}
