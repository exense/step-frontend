import { inject, Injectable } from '@angular/core';
import { NODE_DETAILS_RELATIVE_PARENT } from './node-details-relative-parent.token';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { DrilldownRootType } from '../shared/drilldown-root-type';
import { Location } from '@angular/common';
import {
  DrillDownStackItemConfig,
  DrillDownStackItemType,
  DrillDownStackItemTypeWORoot,
} from '../shared/drilldown-stack-item';
import { Status } from '../../_common/shared/status.enum';
import { AbstractArtefact, ReportNodeWithArtefact } from '@exense/step-core';
import { ALT_EXECUTION_DRILLDOWN_SEGMENTS_LIMIT } from './alt-execution-drilldown-segments-limit.token';
import { AltExecutionTabsService, STATIC_TABS } from './alt-execution-tabs.service';

export interface DrilldownAggregatedParams {
  searchStatus?: Status;
  statusCount?: number;
}

@Injectable()
export class AltExecutionDrilldownNavigationUtilsService {
  private _router = inject(Router);
  private _location = inject(Location);
  private _activatedRoute = inject(ActivatedRoute);
  private _nodeDetailsRelativeParent = inject(NODE_DETAILS_RELATIVE_PARENT, { optional: true }) ?? this._activatedRoute;
  private _segmentsLimit = inject(ALT_EXECUTION_DRILLDOWN_SEGMENTS_LIMIT);
  private _tabs = inject(AltExecutionTabsService);

  getSingleReportNode(data: {
    countByStatus?: Record<string, number>;
    singleInstanceReportNode?: ReportNodeWithArtefact<AbstractArtefact>;
  }): ReportNodeWithArtefact<AbstractArtefact> | undefined {
    const { countByStatus, singleInstanceReportNode } = data;
    const itemsCounts = Object.values(countByStatus ?? {});
    if (itemsCounts.length === 1 && itemsCounts[0] === 1) {
      return singleInstanceReportNode!;
    }
    return undefined;
  }

  openDrilldownRoot(drilldownRootType: DrilldownRootType): void {
    this._router.navigate(['node-details', drilldownRootType], {
      relativeTo: this._nodeDetailsRelativeParent,
      queryParamsHandling: 'merge',
    });
  }

  openDrilldown(
    drilldownRootType: DrilldownRootType,
    type: DrillDownStackItemTypeWORoot,
    detailsId: string,
    params: DrilldownAggregatedParams = {},
    searchFor?: string,
  ): void {
    let queryParams: Params | undefined;
    if (searchFor) {
      queryParams = { searchFor };
    }
    let detailsValueId: string = detailsId;
    if (type === DrillDownStackItemType.AGGREGATED_REPORT_NODE) {
      detailsValueId += `;${params?.searchStatus ?? ''};${params?.statusCount ?? ''}`;
    }
    const nodeDetails = ['node-details', drilldownRootType, type, detailsValueId];
    this._tabs.openDrilldownTab(nodeDetails, queryParams);
    this._router.navigate(nodeDetails, {
      relativeTo: this._nodeDetailsRelativeParent,
      queryParams,
      queryParamsHandling: 'merge',
    });
  }

  changeDrilldownLocation(config: DrillDownStackItemConfig[], searchFor?: string): void {
    const segments = config.map((item) => {
      switch (item.type) {
        case DrillDownStackItemType.ROOT:
          return item.rootType as string;
        case DrillDownStackItemType.AGGREGATED_REPORT_NODE:
          return [
            DrillDownStackItemType.AGGREGATED_REPORT_NODE,
            `${item.nodeId};${item?.searchStatus ?? ''};${item?.searchStatusCount ?? ''}`,
          ];
        case DrillDownStackItemType.REPORT_NODE:
          return [DrillDownStackItemType.REPORT_NODE, item.nodeId];
        case DrillDownStackItemType.PARTIAL_TREE:
          return [DrillDownStackItemType.PARTIAL_TREE, item.nodeId];
      }
    });

    // root(1) + first(1) + segments(n) + last(n)
    const allowedSize = 3 + this._segmentsLimit;
    if (segments.length > allowedSize) {
      // root(1) + first(1) + segments(n)
      const deleteStart = 2 + this._segmentsLimit;
      const deleteCount = segments.length - allowedSize;
      segments.splice(deleteStart, deleteCount);
    }

    const path = segments.flat();
    path.unshift('node-details');

    let queryParams: Params | undefined;
    if (searchFor) {
      queryParams = { searchFor };
    }
    this._tabs.updateActiveDrilldownTab(path, queryParams);

    const urlTree = this._router.createUrlTree(path, {
      relativeTo: this._nodeDetailsRelativeParent,
      queryParams,
      queryParamsHandling: 'merge',
    });
    const url = this._router.serializeUrl(urlTree);

    this._location.go(url);
  }

  closeDrilldown(): void {
    const nextTab = this._tabs.activeDrilldownTabId()
      ? this._tabs.removeDrilldownTab(this._tabs.activeDrilldownTabId()!)
      : undefined;
    if (nextTab) {
      this._router.navigate(nextTab.nodeDetailsPath, {
        relativeTo: this._nodeDetailsRelativeParent,
        queryParams: nextTab.queryParams,
        queryParamsHandling: 'merge',
      });
      return;
    }
    this._router.navigate([STATIC_TABS.REPORT], {
      relativeTo: this._nodeDetailsRelativeParent,
      queryParamsHandling: 'merge',
    });
  }
}
