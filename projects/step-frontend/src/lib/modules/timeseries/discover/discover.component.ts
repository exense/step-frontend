import { AfterViewInit, Component, inject, Inject, OnChanges, OnInit, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DateFormat, Measurement, MeasurementsStats, TimeSeriesService } from '@exense/step-core';
import { HttpClient } from '@angular/common/http';
import { DiscoverDialogData } from './discover-dialog-data';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'step-ts-discover',
  templateUrl: './discover.component.html',
  styleUrls: ['./discover.component.scss'],
})
export class DiscoverComponent implements OnInit {
  readonly DateFormat = DateFormat;
  pageSize = 20;
  pageSizeOptions = [20, 50, 100];
  dataSource: MatTableDataSource<Measurement> = new MatTableDataSource();
  private oqlFilter: string;
  skip = 0;
  hasMore = true;
  isLoading = true;
  allColumns: string[] = [];
  dynamicColumns: string[] = [];
  visibleTableColumns: string[] = [];
  stats: MeasurementsStats | undefined;
  allSelected = true;
  columnsSelection: Record<string, boolean> = {};

  constructor(
    private _matDialogRef: MatDialogRef<DiscoverComponent>,
    @Inject(MAT_DIALOG_DATA) public _data: DiscoverDialogData,
    private _timeSeriesService: TimeSeriesService
  ) {
    this.oqlFilter = _data.oqlFilter;
  }

  ngOnInit(): void {
    this.fetchStats();
    this.fetchMeasurements();
  }

  private fetchMeasurements() {
    this.isLoading = true;
    this._timeSeriesService.discoverMeasurements(this.oqlFilter).subscribe((measurements) => {
      this.dataSource.data = measurements;
      this.isLoading = false;
      if (measurements.length < this.pageSize) {
        this.hasMore = false;
      }
    });
  }

  fetchNextPage(): void {
    if (this.isLoading) {
      return;
    }
    if (this.hasMore) {
      this.skip += this.pageSize;
      this.fetchMeasurements();
    }
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
    this._timeSeriesService.getRawMeasurementsStats(this._data.oqlFilter).subscribe((stats) => {
      this.stats = stats;
      this.dynamicColumns = stats.attributes;
      this.allColumns = ['timestamp', ...this.dynamicColumns];
      this.visibleTableColumns = [...this.allColumns];
      this.visibleTableColumns.forEach((column) => {
        this.columnsSelection[column] = true;
      });
    });
  }
}
