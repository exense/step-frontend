import { Component, inject, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DateFormat, Measurement, MeasurementsStats, TimeSeriesService } from '@exense/step-core';
import { MatTableDataSource } from '@angular/material/table';
import { PageEvent } from '@angular/material/paginator';
import { COMMON_IMPORTS } from '../../types/common-imports.constant';
import { DiscoverAttributeStatsComponent } from '../attribute-stats/attribute-stats.component';

export interface DiscoverDialogData {
  oqlFilter: string;
}

@Component({
  selector: 'step-ts-discover',
  templateUrl: './discover.component.html',
  styleUrls: ['./discover.component.scss'],
  standalone: true,
  imports: [COMMON_IMPORTS, DiscoverAttributeStatsComponent],
})
export class DiscoverComponent implements OnInit {
  private _oqlFilter = inject<DiscoverDialogData>(MAT_DIALOG_DATA).oqlFilter;
  private _matDialogRef = inject<MatDialogRef<DiscoverComponent>>(MatDialogRef);
  readonly DateFormat = DateFormat;
  pageSize = 50;
  dataSource: MatTableDataSource<Measurement> = new MatTableDataSource();
  skip = 0;
  hasMore = true;
  isLoading = true;
  allColumns: string[] = [];
  dynamicColumns: string[] = [];
  visibleTableColumns: string[] = [];
  stats: MeasurementsStats | undefined;
  allSelected = true;
  columnsSelection: Record<string, boolean> = {};

  totalCount = 1000_000;
  currentPage = 0;

  private _timeSeriesService = inject(TimeSeriesService);

  ngOnInit(): void {
    this.fetchStats();
    this.fetchMeasurements();
  }

  private fetchMeasurements() {
    this.isLoading = true;
    this._timeSeriesService
      .discoverMeasurements(this._oqlFilter, this.pageSize, this.currentPage * this.pageSize)
      .subscribe((measurements) => {
        this.dataSource.data = measurements;
        this.isLoading = false;
        if (measurements.length < this.pageSize) {
          this.hasMore = false;
          this.totalCount = this.currentPage * this.pageSize + measurements.length;
        }
      });
  }

  handlePageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.fetchMeasurements();
  }

  onAllColumnsToggle() {
    this.allSelected = !this.allSelected;
    Object.keys(this.columnsSelection).forEach((key) => (this.columnsSelection[key] = this.allSelected));
    this.visibleTableColumns = this.selectVisibleColumns(this.columnsSelection);
  }

  onColumnToggle(attribute: string) {
    this.columnsSelection[attribute] = !this.columnsSelection[attribute];
    this.visibleTableColumns = this.selectVisibleColumns(this.columnsSelection);
  }

  private selectVisibleColumns(columnsSelection: Record<string, boolean>) {
    return this.allColumns.filter((a) => columnsSelection[a]);
  }

  fetchPreviousPage(): void {
    if (this.isLoading) {
      return;
    }
    if (this.skip > 0) {
      this.skip = Math.max(0, this.skip - this.pageSize);
    }
    this.fetchMeasurements();
  }

  private fetchStats() {
    this._timeSeriesService.getRawMeasurementsStats(this._oqlFilter).subscribe((stats) => {
      this.stats = stats;
      this.dynamicColumns = stats.attributes;
      this.allColumns = ['timestamp', ...this.dynamicColumns];
      this.visibleTableColumns = [...this.allColumns];
      this.visibleTableColumns.forEach((column) => {
        this.columnsSelection[column] = true;
      });
    });
  }

  close() {
    this._matDialogRef.close();
  }
}
