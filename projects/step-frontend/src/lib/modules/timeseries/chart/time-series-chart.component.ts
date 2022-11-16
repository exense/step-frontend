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
import { TSTimeRange } from './model/ts-time-range';
import { AlignedData } from 'uplot';
import MouseListener = uPlot.Cursor.MouseListener;

//@ts-ignore
import uPlot = require('uplot');
import { TooltipPlugin } from './tooltip-plugin';

@Component({
  selector: 'step-timeseries-chart',
  templateUrl: './time-series-chart.component.html',
  styleUrls: ['./time-series-chart.component.scss'],
})
export class TimeSeriesChartComponent implements OnInit, AfterViewInit, OnChanges {
  private readonly HEADER_WITH_FOOTER_SIZE = 80;
  readonly WRAPPER_PADDING = '12px';

  @ViewChild('chart') private chartElement!: ElementRef;

  @Input() settings!: TSChartSettings;
  @Input() syncKey: string | undefined; // all the charts with the same syncKey in the app will be synced
  @Input() selection: TSTimeRange | undefined; // deprecated after the refresh -on-zoom feature.

  @Output() onZoomReset = new EventEmitter();
  @Output() onZoomChange = new EventEmitter();

  uplot!: uPlot;

  seriesIndexesByIds: { [key: string]: number } = {}; // for fast accessing

  recreateOnInputChange = true; // the chart will be destroyed and recreated every time a setting or data is changed.

  emptyChart = false; // meaning the chart is already created, but it has no data

  legendSettings: LegendSettings = { items: [] };

  constructor(@Self() private element: ElementRef) {}

  setBlur(blur: boolean) {
    let foundElements = this.chartElement.nativeElement.getElementsByClassName('u-over');
    let overlay = foundElements[0];
    if (!overlay) {
      return;
    }
    if (blur) {
      overlay.style.backdropFilter = 'blur(2px)';
    } else {
      overlay.style.removeProperty('backdrop-filter');
    }
  }

  ngOnInit(): void {
    if (this.syncKey) {
      uPlot.sync(this.syncKey);
    }
  }

  setTitle(title: string): void {
    let titles = this.chartElement.nativeElement.getElementsByClassName('u-title');
    if (titles.length) {
      titles[0].innerHTML = title;
    }
  }

  resetZoom(): void {
    this.uplot.setData(this.uplot.data, true);
  }

  /**
   * @param settings
   */
  createChart(settings: TSChartSettings): void {
    this.legendSettings.items = [];
    let getSize = () => {
      return {
        width: this.element.nativeElement.parentElement.offsetWidth - 24,
        height: this.element.nativeElement.parentElement.offsetHeight - this.HEADER_WITH_FOOTER_SIZE,
      };
    };

    const cursorOpts: uPlot.Cursor = {
      lock: false,
      y: false,
      bind: {
        dblclick: (self: uPlot, target: HTMLElement, handler: MouseListener) => {
          return (e: any) => {
            if (UPlotUtils.isZoomed(this.uplot)) {
              this.onZoomReset.emit(true);
              handler(e);
            }
            return null;
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

    if (settings.axes.length > 1) {
      this.legendSettings.zAxisLabel = this.settings.tooltipOptions.zAxisLabel || 'Total';
    }
    settings.series.forEach((series, i) => {
      if (series.id) {
        this.seriesIndexesByIds[series.id] = i + 1; // because the first series is the time
      }
      if (series.stroke) {
        this.legendSettings.items.push({ color: series.stroke as string, label: series.legendName });
      }
    });
    let noData = true;
    for (let series of settings.series) {
      if (series.data.length > 0) {
        // if at least one series has data, it is not empty
        noData = false;
        break;
      }
    }
    this.emptyChart = noData;
    const opts: uPlot.Options = {
      title: settings.title,
      ms: 1, // if not specified it's going to be in seconds
      ...getSize(),
      legend: { show: false },
      cursor: cursorOpts,
      scales: {
        x: {
          time: true,
          // min: this.selection?.from,
          // max: this.selection?.to,
        },
        // y: {auto: true},
      },
      plugins: this.settings.tooltipOptions.enabled
        ? [TooltipPlugin.getInstance(() => this.settings.tooltipOptions)]
        : [],
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
        setSelect: [(uplot) => {}],
        // setScale: [ (x: any) => console.log(this.isZoomed())]
      },
    };

    let data: AlignedData = [settings.xValues, ...settings.series.map((s) => s.data)];
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

  setSeriesVisibility(id: string, visible: boolean) {
    let index = this.seriesIndexesByIds[id];
    if (index == undefined) return;
    this.uplot.setSeries(index, { show: visible });
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

  clear() {
    this.updateFullData([]);
    this.emptyChart = true;
    this.uplot.axes[0].show = false;
    this.uplot.legend.show = false;
  }

  /**
   * The complete chart data will be overriden
   * @param series
   */
  updateFullData(series: TSChartSeries[]): void {
    this.seriesIndexesByIds = {};
    let data: AlignedData = [this.settings.xValues, ...series.map((s) => s.data)];
    this.uplot.batch(() => {
      this.removeAllSeries();
      this.uplot.addSeries({
        label: 'Timestamp',
      });
      series.forEach((s) => this.uplot.addSeries(s));
      this.uplot.setData(data, true);
    });
  }

  private removeAllSeries() {
    let seriesLength = this.uplot.series.length;
    for (let i = 1; i < seriesLength; i++) {
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

interface LegendSettings {
  items: LegendItem[];
  zAxisLabel?: string;
}

interface LegendItem {
  label: string;
  color: string;
}
