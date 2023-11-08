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
import { AlignedData } from 'uplot';
import { TSChartSeries, TSChartSettings } from './model/ts-chart-settings';
import { TooltipPlugin } from './tooltip-plugin';
import { UplotSyncService } from './uplot-sync-service';
import MouseListener = uPlot.Cursor.MouseListener;

//@ts-ignore
import uPlot = require('uplot');
import { TSTimeRange } from './model/ts-time-range';
import { Execution, ExecutionsService } from '@exense/step-core';
import { Observable } from 'rxjs';

@Component({
  selector: 'step-timeseries-chart',
  templateUrl: './time-series-chart.component.html',
  styleUrls: ['./time-series-chart.component.scss'],
})
export class TimeSeriesChartComponent implements OnInit, AfterViewInit, OnChanges {
  private readonly HEADER_WITH_FOOTER_SIZE = 48;
  chartMetadata: any[][] = [[]]; // 1 on 1 to chart 'data'. first item is time axes
  @ViewChild('chart') private chartElement!: ElementRef;

  @Input() title!: string;
  @Input() settings!: TSChartSettings;
  @Input() syncKey: string | undefined; // all the charts with the same syncKey in the app will be synced

  @Output() onZoomReset = new EventEmitter<void>();
  @Output() onZoomChange = new EventEmitter<TSTimeRange>();

  uplot!: uPlot;

  seriesIndexesByIds: { [key: string]: number } = {}; // for fast accessing

  recreateOnInputChange = true; // the chart will be destroyed and recreated every time a setting or data is changed.

  chartIsEmpty = false; // meaning the chart is already created, but it has no data
  chartIsUnavailable = false;

  legendSettings: LegendSettings = { show: true, items: [] };

  getSize = () => {
    return {
      width: this.element.nativeElement.parentElement.offsetWidth - 32,
      height: this.element.nativeElement.parentElement.offsetHeight - this.HEADER_WITH_FOOTER_SIZE,
    };
  };

  constructor(@Self() private element: ElementRef, private executionService: ExecutionsService) {}

  // used by the tooltip
  getExecutionDetails(executionIds: string[]): Observable<Execution[]> {
    return this.executionService.getExecutionsByIds(executionIds);
  }

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

  ngAfterViewInit(): void {
    this.createChart(this.settings);
  }

  setTitle(title: string): void {
    let titles = this.chartElement.nativeElement.getElementsByClassName('u-title');
    if (titles.length) {
      titles[0].innerHTML = title;
    }
  }

  /**
   * @param settings
   */
  createChart(settings: TSChartSettings): void {
    this.legendSettings.items = [];
    this.chartIsUnavailable = false;
    this.seriesIndexesByIds = {};
    this.chartMetadata = [[]];

    const cursorOpts: uPlot.Cursor = {
      lock: settings.showExecutionsLinks,
      y: false,
      bind: {
        dblclick: (self: uPlot, target: HTMLElement, handler: MouseListener) => {
          return (e: any) => {
            this.onZoomReset.emit();
            handler(e);
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
        // aggregate series don't have stroke (e.g total)
        this.legendSettings.items.push({
          seriesId: series.id,
          color: (series.stroke as string) || '#cccccc',
          label: series.legendName,
          isVisible: series.show ?? true,
        });
      }
    });
    this.sortLegend();
    let noData = true;
    for (let series of settings.series) {
      if (series.data.length > 0) {
        // if at least one series has data, it is not empty
        noData = false;
        break;
      }
    }
    this.chartIsEmpty = noData;
    const opts: uPlot.Options = {
      title: this.title || settings.title,
      ms: 1, // if not specified it's going to be in seconds
      ...this.getSize(),
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
      plugins: this.settings.tooltipOptions.enabled ? [TooltipPlugin.getInstance(this)] : [],
      axes: [{}, ...(settings.axes || [])],
      series: [
        {
          label: 'Timestamp',
          value: (x: uPlot, timestamp: number) => {
            let date = new Date(timestamp);
            return date.toLocaleDateString() + ` ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
          },
        },
        ...settings.series.filter((s) => s.show !== false),
      ],
      hooks: {
        ...settings.hooks,
        setSelect: [
          (u: uPlot) => {
            if (u.select.width < 1) {
              // this is the bug from uplot. See https://github.com/leeoniya/uPlot/issues/766
              return;
            }
            const min = u.posToVal(u.select.left, 'x');
            const max = u.posToVal(u.select.left + u.select.width, 'x');
            if (min < max) {
              this.onZoomChange.next({ from: min, to: max });
            }
          },
          ...(settings.hooks?.setSelect || []),
        ],
      },
    };

    let data: AlignedData = [settings.xValues, ...settings.series.map((s) => s.data)];
    if (this.uplot) {
      this.uplot.destroy();
    }
    this.uplot = new uPlot(opts, data, this.chartElement.nativeElement);
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

  setAsUnavailable(): void {
    this.uplot.setData([]);
    this.chartIsUnavailable = true;
  }

  showSeries(id: string): void {
    let index = this.seriesIndexesByIds[id];
    if (index == undefined) return;
    this.uplot.setSeries(index, { show: true });
    let foundItem = this.legendSettings.items.find((item) => item.label === id);
    if (foundItem) {
      foundItem.isVisible = true;
    }
  }

  hideSeries(id: string): void {
    let index = this.seriesIndexesByIds[id];
    if (index == undefined) return;
    this.uplot.setSeries(index, { show: false });
    let foundItem = this.legendSettings.items.find((item) => item.label === id);
    if (foundItem) {
      foundItem.isVisible = false;
    }
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

  sortLegend() {
    if (this.legendSettings) {
      this.legendSettings.items = this.legendSettings.items.sort((a, b) => a.label.localeCompare(b.label));
    }
  }

  setAllSeries(visible: boolean): void {
    this.uplot.batch(() => {
      this.uplot.series.forEach((s, i) => {
        this.uplot.setSeries(i, { show: visible });
      });
    });
    this.legendSettings.items.forEach((item) => (item.isVisible = visible));
  }

  /**
   * Switches the state of the specified series.
   */
  toggleSeries(id: string): void {
    const index = this.seriesIndexesByIds[id];
    if (index == undefined) return;
    let currentState = this.uplot.series[index].show;
    if (currentState) {
      this.hideSeries(id);
    } else {
      this.showSeries(id);
    }
  }

  setSeriesVisibility(id: string, visible: boolean) {
    let index = this.seriesIndexesByIds[id];
    if (index == undefined) return;
    if (visible) {
      this.showSeries(id);
    } else {
      this.hideSeries(id);
    }
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

  addDataBySeriesIndex(data: number[], seriesIndex: number): void {
    let existingData = this.uplot.data[seriesIndex] as number[];
    this.uplot.data[seriesIndex] = [...existingData, ...data];
  }

  clear() {
    this.updateFullData([]);
    this.chartIsEmpty = true;
    this.uplot.axes[0].show = false;
    this.uplot.legend.show = false;
  }

  /**
   * The complete chart data will be updated
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
      series.forEach((s, i) => {
        this.uplot.addSeries(s);
        this.seriesIndexesByIds[i] = i + 1;
      });
      this.uplot.setData(data, true);
    });
  }

  private removeAllSeries() {
    let seriesLength = this.uplot.series.length;
    for (let i = 1; i < seriesLength; i++) {
      this.uplot.delSeries(1); // we clean everything
    }
    this.uplot.delSeries(0);
    this.legendSettings.items = [];
  }

  redraw(): void {
    this.uplot.setData(this.uplot.data);
    this.resize();
  }

  resize() {
    this.uplot.setSize(this.getSize());
  }
}

interface LegendSettings {
  show: boolean;
  items: LegendItem[];
  zAxisLabel?: string;
}

interface LegendItem {
  seriesId: string;
  label: string;
  color: string;
  isVisible: boolean;
}
