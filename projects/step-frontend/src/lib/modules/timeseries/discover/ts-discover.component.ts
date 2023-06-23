import { AfterViewInit, Component, inject, Inject, OnChanges, OnInit, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DateFormat, MeasurementsStats, TimeSeriesService } from '@exense/step-core';
import { HttpClient } from '@angular/common/http';
import { DiscoverDialogData } from './discover-dialog-data';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'step-ts-discover',
  templateUrl: './ts-discover.component.html',
  styleUrls: ['./ts-discover.component.scss'],
})
export class TsDiscoverComponent implements OnInit {
  readonly DateFormat = DateFormat;
  readonly PAGE_SIZE = 20;
  readonly _dialogRef = inject(MatDialogRef);
  dataSource: MatTableDataSource<any> = new MatTableDataSource();
  oqlFilter: string;
  skip = 0;
  hasMore = true;
  isLoading = true;
  allColumns: string[] = [];
  dynamicColumns: string[] = [];
  visibleTableColumns: string[] = [];
  stats: MeasurementsStats | undefined;
  allSelected = true;
  columnsSelection: { [key: string]: boolean } = {};

  constructor(
    private _matDialogRef: MatDialogRef<TsDiscoverComponent>,
    @Inject(MAT_DIALOG_DATA) public _data: DiscoverDialogData,
    private timeSeriesService: TimeSeriesService,
    private http: HttpClient
  ) {
    this.oqlFilter = _data.oqlFilter;
  }

  ngOnInit(): void {
    this.fetchStats();
    this.fetchMeasurements();
  }

  private fetchMeasurements() {
    this.isLoading = true;
    const oql = this._data.oqlFilter;
    this.http
      .get<any[]>(`/rest/time-series/raw-measurements?filter=${oql}&limit=${this.PAGE_SIZE}&skip=${this.skip}`)
      .subscribe((measurements) => {
        this.dataSource.data = measurements;
        this.isLoading = false;
        if (measurements.length < this.PAGE_SIZE) {
          this.hasMore = false;
        }
      });
  }

  fetchNextPage(): void {
    if (this.isLoading) {
      return;
    }
    if (this.hasMore) {
      this.skip += this.PAGE_SIZE;
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

  private selectVisibleColumns(columnsSelection: { [key: string]: boolean }) {
    return this.allColumns.filter((a) => columnsSelection[a]);
  }

  fetchPreviousPage(): void {
    if (this.isLoading) {
      return;
    }
    if (this.skip > 0) {
      this.skip = Math.max(0, this.skip - this.PAGE_SIZE);
    }
    this.fetchMeasurements();
  }

  private fetchStats() {
    this.timeSeriesService.getRawMeasurementsStats(this._data.oqlFilter).subscribe((stats) => {
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
