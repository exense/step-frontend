import {
  Component,
  ContentChild,
  ElementRef,
  EmbeddedViewRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { AlignedData } from 'uplot';
import { TooltipPlugin } from '../../injectables/tooltip-plugin';
import { MarkerType, TimeRange } from '@exense/step-core';
import { COMMON_IMPORTS, TimeSeriesConfig, UPlot } from '../../../_common';
import { TSChartSeries } from '../../types/ts-chart-series';
import { TSChartSettings } from '../../types/ts-chart-settings';
import { TooltipParentContainer } from '../../types/tooltip-parent-container';
//@ts-ignore
import uPlot = require('uplot');
import MouseListener = uPlot.Cursor.MouseListener;
import { UPlotStackedUtils } from '../../../_common/UPlotStackedUtils';
import { CustomTooltipPlugin } from '../../injectables/custom-tooltip-plugin';
import { TooltipContextData } from '../../injectables/tooltip-context-data';

const DEFAULT_STROKE_COLOR = '#cccccc';

const DEFAULT_TIMESTAMP_FORMAT_FN: (
  self: uPlot,
  rawValue: number,
  seriesIdx: number,
  idx: number,
) => string | number = (self: uPlot, rawValue: number, seriesIdx: number, idx: number): string | number => {
  let date = new Date(rawValue);
  return date.toLocaleDateString() + ` ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
};

@Component({
  selector: 'step-timeseries-chart',
  templateUrl: './time-series-chart.component.html',
  styleUrls: ['./time-series-chart.component.scss'],
  providers: [TooltipPlugin, CustomTooltipPlugin],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [COMMON_IMPORTS],
})
export class TimeSeriesChartComponent implements OnInit, OnChanges, OnDestroy, TooltipParentContainer {
  private _element = inject(ElementRef);
  private _tooltipPlugin = inject(TooltipPlugin);
  private _customTooltipPlugin = inject(CustomTooltipPlugin);

  private readonly HEADER_HEIGHT = 27;
  private readonly LEGEND_HEIGHT = 24;

  chartMetadata: Record<string, any>[] = [[]]; // 1 on 1 to chart 'data'. first item is time axes
  @ViewChild('chart', { static: true }) private chartElement!: ElementRef;

  @Input() title!: string;
  @Input() settings!: TSChartSettings;
  @Input() syncKey: string | undefined; // all the charts with the same syncKey in the app will be synced
  @Input() height: number = 300;
  @Input() legendMarker: MarkerType = MarkerType.SQUARE;

  @Output() zoomReset = new EventEmitter<void>();
  @Output() zoomChange = new EventEmitter<TimeRange>(); // warning! this event will be emitted by all charts synchronized.
  @Output() lockStateChange = new EventEmitter<boolean>();

  @ContentChild(TemplateRef) tooltipTemplate!: TemplateRef<any>;

  uplot!: uPlot;

  seriesIndexesByIds: { [key: string]: number } = {}; // for fast accessing

  recreateOnInputChange = true; // the chart will be destroyed and recreated every time a setting or data is changed.

  chartIsEmpty = false; // meaning the chart is already created, but it has no data
  chartIsUnavailable = false;

  legendSettings: LegendSettings = { show: true, items: [], expanded: false };

  tooltipEmbeddedView?: EmbeddedViewRef<any>;

  // this will be called from the tooltip instance.
  // returns true if the tooltip should be rendered. false otherwise
  renderTooltip = (container: any, data: TooltipContextData): boolean => {
    let allSeriesAreEmpty = true;
    for (let i = 0; i < data.series.length; i++) {
      let value = data.series[i].data[data.idx!];
      if (value && value > 0) {
        allSeriesAreEmpty = false;
        break;
      }
    }
    if (allSeriesAreEmpty) {
      container.innerHTML = '';
      this.tooltipEmbeddedView?.destroy();
      this.tooltipEmbeddedView = undefined;
      return false;
    }

    if (this.tooltipEmbeddedView) {
      this.tooltipEmbeddedView.context.$implicit = data;
    } else {
      this.tooltipEmbeddedView = this.tooltipTemplate.createEmbeddedView({ $implicit: data });
      this.tooltipEmbeddedView.rootNodes.forEach((node) => {
        container.appendChild(node); // Append each node to the target element
      });
    }
    this.tooltipEmbeddedView.detectChanges();
    return true;
  };

  private uplotSyncFunction: UPlot.default.Cursor.Sync.ScaleKeyMatcher = (
    subScaleKey: string | null,
    pubScaleKey: string | null,
  ) => subScaleKey == pubScaleKey;

  getSize = () => {
    return {
      width: this._element.nativeElement.parentElement.offsetWidth - 12,
      height: this.height - this.HEADER_HEIGHT - this.LEGEND_HEIGHT,
    };
  };

  ngOnInit(): void {
    if (!this.settings) {
      throw new Error('Missing settings input');
    }
    if (this.syncKey) {
      uPlot.sync(this.syncKey);
    }
    this.createChart(this.settings);
  }

  setTitle(title: string): void {
    let titles = this.chartElement.nativeElement.getElementsByClassName('u-title');
    if (titles.length) {
      titles[0].innerHTML = title;
    }
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

  /**
   * @param settings
   */
  createChart(settings: TSChartSettings): void {
    this.legendSettings.items = [];
    this.legendSettings.show = settings.showLegend ?? true;
    this.chartIsUnavailable = false;
    this.seriesIndexesByIds = {};
    this.chartMetadata = [[]];

    const cursorOpts: uPlot.Cursor = {
      show: this.settings.showCursor ?? true,
      lock: settings.tooltipOptions.useExecutionLinks,
      y: false,
      bind: {
        dblclick: (self: uPlot, target: HTMLElement, handler: MouseListener) => {
          return (e: any) => {
            this.zoomReset.emit();
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
        match: [this.uplotSyncFunction, this.uplotSyncFunction],
      };
    }

    if (settings.axes.length > 1) {
      this.legendSettings.zAxisLabel = this.settings.tooltipOptions.zAxisLabel || 'Total';
    } else {
      this.legendSettings.zAxisLabel = undefined;
    }
    settings.series.forEach((series, i) => {
      if (series.id) {
        this.seriesIndexesByIds[series.id] = i + 1; // because the first series is the time
      }
      series.label = this.mergeLabelItems(series.labelItems);
      this.chartMetadata.push(series.metadata || []);
      // aggregate series don't have stroke (e.g total)
      if (series.scale !== 'z') {
        series.stroke = series.strokeConfig?.color || series.stroke || DEFAULT_STROKE_COLOR;
        if (series.stroke.length === 7) {
          series.stroke += 'cc'; // lower the opacity for more clarity
        }
        this.legendSettings.items.push({
          seriesId: series.id,
          color: series.strokeConfig?.color || series.stroke || DEFAULT_STROKE_COLOR,
          strokeType: series.strokeConfig?.type || MarkerType.SQUARE,
          label: this.mergeLabelItems(series.labelItems),
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

    let plugins = [];
    if (Math.random() > 0) {
      plugins = this.settings.tooltipOptions.enabled
        ? [this._customTooltipPlugin.createPlugin(this, this.renderTooltip)]
        : [];
    } else {
      plugins = this.settings.tooltipOptions.enabled ? [this._tooltipPlugin.createPlugin(this)] : [];
    }

    let opts: uPlot.Options = {
      title: this.title || settings.title,
      ms: 1, // if not specified it's going to be in seconds
      ...this.getSize(),
      legend: { show: !!settings.showDefaultLegend },
      cursor: cursorOpts,
      // @ts-ignore
      select: { show: settings.zoomEnabled ?? true },
      scales: {
        x: {
          time: settings.xAxesSettings.time ?? true,
          // @ts-ignore
          range: (uPlot, min, max) => {
            return [min - 1, max + 1];
          }, // Add padding to x-axis range
          // min: this.selection?.from,
          // max: this.selection?.to,
        },
        ...settings.scales,
      },
      plugins: plugins,
      axes: [{ show: settings.xAxesSettings.show ?? true }, ...(settings.axes || [])],
      series: [
        {
          label:
            this.settings.xAxesSettings.label || (this.settings.xAxesSettings.time ?? true ? 'Timestamp' : 'Value'),
          value: this.settings.xAxesSettings.valueFormatFn || DEFAULT_TIMESTAMP_FORMAT_FN,
        },
        ...settings.series, // show flag will show/hide series, but they will still exist in the chart
      ],
      bands: settings.bands,
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
              this.zoomChange.emit({ from: min, to: max });
            }
          },
          ...(settings.hooks?.setSelect || []),
        ],
      },
    };
    let data: AlignedData = [settings.xAxesSettings.values, ...settings.series.map((s) => s.data)];
    if (this.uplot) {
      this.uplot.destroy();
    }
    //@ts-ignore
    // opts = UPlotStackedUtils.getStackedOpts('test', settings.series, data, undefined);
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
    let foundItem = this.legendSettings.items.find((item) => item.seriesId === id);
    if (foundItem) {
      foundItem.isVisible = true;
    }
  }

  hideSeries(id: string): void {
    let index = this.seriesIndexesByIds[id];
    if (index == undefined) return;
    this.uplot.setSeries(index, { show: false });
    let foundItem = this.legendSettings.items.find((item) => item.seriesId === id);
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

  setLabelItem(seriesId: string, labelIndex: number, label?: string): void {
    const index = this.seriesIndexesByIds[seriesId];
    if (index === undefined || !label) return;
    const series = this.uplot.series[index];
    // @ts-ignore
    const labelItems = series.labelItems;
    labelItems[labelIndex] = label;
    const finalLabel = this.mergeLabelItems(labelItems);
    series.label = finalLabel;
    const legendItem = this.legendSettings.items.find((i) => i.seriesId === seriesId);
    if (legendItem) {
      legendItem.label = finalLabel;
    }
  }

  private mergeLabelItems(items: (string | undefined)[]): string {
    if (items.length === 0) {
      return TimeSeriesConfig.SERIES_LABEL_VALUE;
    }
    return items.map((i) => i ?? TimeSeriesConfig.SERIES_LABEL_EMPTY).join(' | ');
  }

  setSeriesLabel(id: string, label: string): void {
    if (!label) {
      return;
    }
    const index = this.seriesIndexesByIds[id];
    if (index === undefined) return;
    const series = this.uplot.series[index];
    series.label = label;
    const legendItem = this.legendSettings.items.find((i) => i.seriesId === id);
    if (legendItem) {
      legendItem.label = label;
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
    let data: AlignedData = [this.settings.xAxesSettings.values, ...series.map((s) => s.data)];
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

  ngOnDestroy(): void {
    this.uplot?.destroy();
  }
}

interface LegendSettings {
  show: boolean;
  items: LegendItem[];
  zAxisLabel?: string;
  expanded: boolean;
}

interface LegendItem {
  seriesId: string;
  label: string;
  color: string;
  strokeType: MarkerType;
  isVisible: boolean;
}
