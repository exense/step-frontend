import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  Self,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { TSChartSeries, TSChartSettings } from './model/ts-chart-settings';
import { UplotSyncService } from './uplot-sync-service';
import { UPlotUtils } from '../uplot/uPlot.utils';

declare const uPlot: any;

@Component({
  selector: 'step-timeseries-chart',
  templateUrl: './time-series-chart.component.html',
  styleUrls: ['./time-series-chart.component.scss'],
})
export class TimeSeriesChartComponent implements OnInit, AfterViewInit, OnChanges {
  private readonly HEADER_WITH_FOOTER_SIZE = 94;
  readonly WRAPPER_PADDING_PX = 12;
  readonly WRAPPER_PADDING = '12px';

  @ViewChild('chart') private chartElement!: ElementRef;

  @Input('settings') settings!: TSChartSettings;
  @Input('syncKey') syncKey: string | undefined;

  @Output('onZoomReset') onZoomReset = new EventEmitter();

  uplot!: uPlot;

  seriesIndexesByIds: { [key: string]: number } = {};

  constructor(@Self() private element: ElementRef) {}

  ngOnInit(): void {
    if (this.syncKey) {
      uPlot.sync(this.syncKey);
    }
  }

  ngAfterViewInit(): void {
    let getSize = () => {
      return {
        width: this.element.nativeElement.parentElement.offsetWidth - 24,
        height: this.element.nativeElement.parentElement.offsetHeight - this.HEADER_WITH_FOOTER_SIZE,
      };
    };

    const cursorOpts = {
      lock: false,
      // focus: {
      //     prox: 16,
      // },
      y: false,
      sync: {},
      bind: {
        // @ts-ignore
        dblclick: (self, b, handler) => {
          return (e: any) => {
            if (UPlotUtils.isZoomed(this.uplot)) {
              this.onZoomReset.emit(true);
              handler(e);
            }
          };
        },
      },
      ...this.settings.cursor,
    };
    if (this.syncKey) {
      cursorOpts.sync = {
        key: this.syncKey,
        setSeries: false,
        match: [UplotSyncService.syncFunction, UplotSyncService.syncFunction],
      };
    }

    this.settings.series.forEach((series, i) => {
      if (series.id) {
        this.seriesIndexesByIds[series.id] = i + 1; // because the first series is the time
      }
    });

    const opts = {
      title: this.settings.title,
      ms: 1, // if not specified it's going to be in seconds
      ...getSize(),
      legend: { show: this.settings.showLegend },
      cursor: cursorOpts,
      scales: {
        x: {
          time: true,
        },
        y: {},
      },
      axes: [{}, ...(this.settings.axes || [])],
      series: [
        {
          label: 'Timestamp',
        },
        ...this.settings.series,
      ],
      hooks: {
        // setSelect: [ () => console.log('select')],
        // setScale: [ (x: any) => console.log(this.isZoomed())]
      },
    };

    this.uplot = new uPlot(
      opts,
      [this.settings.xValues, ...this.settings.series.map((s) => s.data)],
      this.chartElement.nativeElement
    );
    if (this.settings.autoResize !== false) {
      window.addEventListener('resize', (e) => {
        this.uplot.setSize(getSize());
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {}

  update(): void {}

  showSeries(id: string) {
    let index = this.seriesIndexesByIds[id];
    if (index == undefined) return;
    this.uplot.setSeries(index, { show: true });
  }

  hideSeries(id: string) {
    let index = this.seriesIndexesByIds[id];
    if (index == undefined) return;
    this.uplot.setSeries(index, { show: false });
  }

  toggleSeries(id: string) {
    let index = this.seriesIndexesByIds[id];
    if (index == undefined) return;
    let currentState = this.uplot.series[index].show;
    this.uplot.setSeries(index, { show: !currentState });
  }

  addSeries(series: TSChartSeries) {
    let existingSeries = this.seriesIndexesByIds[series.id];
    if (existingSeries) {
      throw new Error('Series already exists with id ' + series.id);
    }
    this.uplot.addSeries(series);
    this.seriesIndexesByIds[series.id] = this.uplot.series.length;
  }

  getSeriesIndex(key: string): number {
    return this.seriesIndexesByIds[key];
  }

  hasSeries(id: string) {
    return !!this.seriesIndexesByIds[id];
  }

  addDataByKey(data: number[], key: string) {
    let index = this.seriesIndexesByIds[key];
    if (index === undefined) {
      throw new Error('Series id not found: ' + key);
    } else {
      this.addData(data, index);
    }
  }

  // this is removing the last element in the chart. this is used while streaming, in order to replace the element with a full set of data
  removeTail() {
    this.uplot.data.forEach((series) => {
      (series as number[]).pop();
    });
  }

  addData(data: number[], seriesIndex: number) {
    let existingData = this.uplot.data[seriesIndex] as number[];
    this.uplot.data[seriesIndex] = [...existingData, ...data];
  }

  redraw() {
    this.uplot.setData(this.uplot.data);
  }

  getLastTimestamp(): number {
    let timestampSeries = this.uplot.data[0];
    return timestampSeries[timestampSeries.length - 1];
  }
}
