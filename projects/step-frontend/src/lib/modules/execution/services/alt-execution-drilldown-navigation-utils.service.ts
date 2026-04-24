import { inject, Injectable } from '@angular/core';
import { NODE_DETAILS_RELATIVE_PARENT } from './node-details-relative-parent.token';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { DrilldownRootType } from '../shared/drilldown-root-type';
import { Location } from '@angular/common';
import { DrillDownStackItemConfig, DrillDownStackItemType } from '../shared/drilldown-stack-item';
import { Status } from '../../_common/shared/status.enum';
import { AbstractArtefact, ReportNodeWithArtefact } from '@exense/step-core';
import { ALT_EXECUTION_DRILLDOWN_SEGMENTS_LIMIT } from './alt-execution-drilldown-segments-limit.token';

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

  openDrilldown(
    drilldownRootType: DrilldownRootType,
    type: 'report' | 'aggregated',
    detailsId: string,
    params: DrilldownAggregatedParams = {},
    searchFor?: string,
  ): void {
    let queryParams: Params | undefined;
    if (searchFor) {
      queryParams = { searchFor };
    }
    let detailsValueId: string = detailsId;
    if (type === 'aggregated') {
      detailsValueId += `;${params?.searchStatus ?? ''};${params?.statusCount ?? ''}`;
    }
    const nodeDetails = ['node-details', drilldownRootType, type, detailsValueId];
    this._router.navigate([{ outlets: { nodeDetails } }], {
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
          return ['aggregated', `${item.nodeId};${item?.searchStatus ?? ''};${item?.searchStatusCount ?? ''}`];
        case DrillDownStackItemType.REPORT_NODE:
          return ['report', item.nodeId];
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

    const urlTree = this._router.createUrlTree([{ outlets: { nodeDetails: path } }], {
      relativeTo: this._nodeDetailsRelativeParent,
      queryParams,
      queryParamsHandling: 'merge',
    });
    const url = this._router.serializeUrl(urlTree);

    setTimeout(() => {
      this._location.go(url);
    }, 0);
  }

  closeDrilldown(): void {
    this._router.navigate([{ outlets: { nodeDetails: null } }], {
      relativeTo: this._nodeDetailsRelativeParent,
      queryParamsHandling: 'merge',
    });
  }
}
