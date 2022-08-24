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
  ViewEncapsulation,
} from '@angular/core';
import { TSChartSeries, TSChartSettings } from './model/ts-chart-settings';
import { UplotSyncService } from './uplot-sync-service';
import { UPlotUtils } from '../uplot/uPlot.utils';
import { tooltipPlugin } from './tooltip-plugin';
import { TSTimeRange } from './model/ts-time-range';
import { AlignedData } from 'uplot';
import MouseListener = uPlot.Cursor.MouseListener;

declare const uPlot: any;

@Component({
  selector: 'step-timeseries-chart',
  templateUrl: './time-series-chart.component.html',
  styleUrls: ['./time-series-chart.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TimeSeriesChartComponent implements OnInit, AfterViewInit, OnChanges {
  private readonly HEADER_WITH_FOOTER_SIZE = 94;
  readonly WRAPPER_PADDING_PX = 12;
  readonly WRAPPER_PADDING = '12px';

  @ViewChild('chart') private chartElement!: ElementRef;

  @Input('settings') settings!: TSChartSettings;
  @Input('syncKey') syncKey: string | undefined; // all the charts with the same syncKey in the app will be synced
  @Input('selection') selection: TSTimeRange | undefined;

  @Output('onZoomReset') onZoomReset = new EventEmitter();

  uplot!: uPlot;

  seriesIndexesByIds: { [key: string]: number } = {}; // for fast accessing

  recreateOnInputChange = true; // the chart will be destroyed and recreated every time a setting or data is changed.

  constructor(@Self() private element: ElementRef) {}

  ngOnInit(): void {
    if (this.syncKey) {
      uPlot.sync(this.syncKey);
    }
  }

  resetZoom(): void {
    this.uplot.setData(this.uplot.data, true);
  }

  /**
   * @param settings
   */
  createChart(settings: TSChartSettings): void {
    let getSize = () => {
      return {
        width: this.element.nativeElement.parentElement.offsetWidth - 24,
        height: this.element.nativeElement.parentElement.offsetHeight - this.HEADER_WITH_FOOTER_SIZE,
      };
    };

    const cursorOpts = {
      lock: false,
      y: false,
      sync: {},
      bind: {
        dblclick: (self: uPlot, target: HTMLElement, handler: MouseListener) => {
          return (e: any) => {
            if (UPlotUtils.isZoomed(this.uplot)) {
              this.onZoomReset.emit(true);
              handler(e);
            }
          };
        },
      },
      ...settings.cursor,
    };
    if (this.syncKey) {
      cursorOpts.sync = {
        key: this.syncKey,
        setSeries: false,
        match: [UplotSyncService.syncFunction, UplotSyncService.syncFunction],
      };
    }

    settings.series.forEach((series, i) => {
      if (series.id) {
        this.seriesIndexesByIds[series.id] = i + 1; // because the first series is the time
      }
    });
    const opts = {
      title: settings.title,
      ms: 1, // if not specified it's going to be in seconds
      ...getSize(),
      legend: { show: settings.showLegend },
      cursor: cursorOpts,
      scales: {
        x: {
          time: true,
          min: this.selection?.from,
          max: this.selection?.to,
        },
        // y: {auto: true},
      },
      plugins: [tooltipPlugin(this.settings.yScaleUnit)],
      axes: [{}, ...(settings.axes || [])],
      series: [
        {
          label: 'Timestamp',
          value: (x: uPlot, timestamp: number) => {
            let date = new Date(timestamp);
            return date.toLocaleDateString() + ` ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
          },
        },
        ...settings.series,
      ],
      hooks: {
        init: [
          (u: any) => {
            u.root.addEventListener('click', (e: any) => {
              let hoveredSeriesIdx = u.cursor.idxs.findIndex((v: number) => v != null);

              if (hoveredSeriesIdx != -1) {
                let hoveredDataIdx = u.cursor.idxs[hoveredSeriesIdx];
                let seriesOpts = u.series[hoveredSeriesIdx];
                let facetsData = u.data[hoveredSeriesIdx];
              }
            });
          },
        ],
        // setSelect: [ () => console.log('select')],
        // setScale: [ (x: any) => console.log(this.isZoomed())]
      },
    };

    let data = [settings.xValues, ...settings.series.map((s) => s.data)];
    if (this.uplot) {
      this.uplot.destroy();
    }
    this.uplot = new uPlot(opts, data, this.chartElement.nativeElement);
    if (settings.autoResize !== false) {
      window.addEventListener('resize', (e) => {
        this.uplot.setSize(getSize());
      });
    }
  }

  ngAfterViewInit(): void {
    this.createChart(this.settings);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.recreateOnInputChange) {
      let settings = changes['settings'];
      if (settings && settings.previousValue) {
        // it's a real edit
        this.createChart(this.settings);
      }
    }
  }

  showSeries(id: string): void {
    let index = this.seriesIndexesByIds[id];
    if (index == undefined) return;
    this.uplot.setSeries(index, { show: true });
  }

  hideSeries(id: string): void {
    let index = this.seriesIndexesByIds[id];
    if (index == undefined) return;
    this.uplot.setSeries(index, { show: false });
  }

  hideAllSeries(): void {
    this.setAllSeries(false);
  }

  showAllSeries(): void {
    this.setAllSeries(true);
  }

  setData(data: AlignedData, resetScale = false) {
    let scale = this.uplot.scales['x'];
    console.log(scale);
    this.uplot.setData(data, resetScale); // if it is false, it's not going change the X scale (zooming)
    this.uplot.redraw();
  }

  getData(): AlignedData {
    return this.uplot.data;
  }

  setAllSeries(visible: boolean): void {
    this.uplot.batch(() => {
      this.uplot.series.forEach((s, i) => {
        this.uplot.setSeries(i, { show: visible });
      });
    });
  }

  /**
   * Switches the state of the specified series.
   */
  toggleSeries(id: string): void {
    let index = this.seriesIndexesByIds[id];
    if (index == undefined) return;
    let currentState = this.uplot.series[index].show;
    this.uplot.setSeries(index, { show: !currentState });
  }

  addSeries(series: TSChartSeries): void {
    let existingSeries = this.seriesIndexesByIds[series.id];
    if (existingSeries) {
      throw new Error('Series already exists with id ' + series.id);
    }
    this.uplot.addSeries(series);
    this.seriesIndexesByIds[series.id] = this.uplot.series.length;
  }

  /**
   * Series settings and data are index related.
   */
  getSeriesIndex(key: string): number {
    return this.seriesIndexesByIds[key];
  }

  hasSeries(id: string): boolean {
    return !!this.seriesIndexesByIds[id];
  }

  addDataBySeries(data: number[], seriesKey: string): void {
    let index = this.seriesIndexesByIds[seriesKey];
    if (index === undefined) {
      throw new Error('Series id not found: ' + seriesKey);
    } else {
      this.addDataBySeriesIndex(data, index);
    }
  }

  addDataBySeriesIndex(data: number[], seriesIndex: number): void {
    let existingData = this.uplot.data[seriesIndex] as number[];
    this.uplot.data[seriesIndex] = [...existingData, ...data];
  }

  /**
   * The complete chart data will be override
   * @param series
   */
  updateFullData(series: TSChartSeries[]): void {
    this.seriesIndexesByIds = {};
    let data = [this.settings.xValues, ...series.map((s) => s.data)];
    this.uplot.batch(() => {
      this.clearChart();
      this.uplot.addSeries({
        label: 'Timestamp',
      });
      series.forEach((s) => this.uplot.addSeries(s));
      // @ts-ignore
      this.uplot.setData(data, true);
    });
  }

  clearChart() {
    let seriesLength = this.uplot.series.length;
    for (let i = 0; i < seriesLength; i++) {
      this.uplot.delSeries(1); // we clean everything
    }
    this.uplot.delSeries(0);
  }

  redraw(): void {
    this.uplot.setData(this.uplot.data);
  }

  getLastTimestamp(): number {
    let timestampSeries = this.uplot.data[0];
    return timestampSeries[timestampSeries.length - 1];
  }
}
