import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { TSRangerSettings } from './ts-ranger-settings';
import { UplotSyncService } from '../chart/uplot-sync-service';
import { TSTimeRange } from '../chart/model/ts-time-range';
import { UPlotUtils } from '../uplot/uPlot.utils';
import { from, timeout } from 'rxjs';
import { TSChartSettings } from '../chart/model/ts-chart-settings';
import { ExecutionTabContext } from '../execution-page/execution-tab-context';

declare const uPlot: any;

/**
 * There are 3 ways of interaction with the ranger:
 * 1. Dragging the handle bars
 * 2. Dbl clicking (zoom reset)
 * 3. zooming from a linked chart
 * 4. resetting zoom from a linked chart -> a manual reset function has to be called here
 */
@Component({
  selector: 'step-ts-ranger',
  templateUrl: './ts-ranger.component.html',
  styleUrls: ['./ts-ranger.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TSRangerComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild('chart') private chartElement!: ElementRef;

  @Input('settings') settings!: TSRangerSettings;
  @Input('syncKey') syncKey: string | undefined;
  @Input('selection') selection?: TSTimeRange;

  /**
   * This should emit the following events only:
   * 1. when a synced chart or this chart is zooming
   * 2. when the grips are moved
   */
  @Output('onRangeChange') onRangeChange = new EventEmitter<TSTimeRange>();

  @Output('onZoomReset') onZoomReset = new EventEmitter<TSTimeRange>();

  uplot!: any;
  previousRange: TSTimeRange | undefined;

  start!: number;
  end!: number;

  constructor() {}

  ngOnInit(): void {
    if (this.syncKey) {
      uPlot.sync(this.syncKey);
    }

    this.init(this.settings);
  }

  init(settings: TSRangerSettings) {
    this.start = settings.xValues[0];
    this.end = settings.xValues[this.settings.xValues.length - 1];
  }

  ngAfterViewInit(): void {
    this.createRanger();
  }

  ngOnChanges(changes: SimpleChanges): void {
    let settings = changes['settings'];
    if (settings && settings.previousValue) {
      // it's a real change
      this.init(settings.currentValue);
      let end = this.settings.xValues[this.settings.xValues.length - 1];
      let start = this.settings.xValues[0];
      console.log(new Date(start), new Date(end));
      this.createRanger();
    }
  }

  selectRange(fromTimestamp?: number, toTimestamp?: number) {
    let select = this.transformRangeToSelect({ from: fromTimestamp, to: toTimestamp });

    this.uplot.setSelect(select, false);
    this.emitSelectionToLinkedCharts();

    // if (emitChangeEvent) {
    //   this.onRangeChange.emit({ start: fromTimestamp, end: toTimestamp });
    // }
  }

  transformRangeToSelect(range?: TSTimeRange) {
    if (!range) {
      return undefined;
    }
    let fromTimestamp = range.from;
    let toTimestamp = range.to;
    let left, width;
    let height = this.uplot.bbox.height / devicePixelRatio;
    if (!fromTimestamp) {
      left = Math.round(this.uplot.valToPos(this.start, 'x'));
    } else {
      // console.log('LeftValToPos=', this.uplot.valToPos(fromTimestamp, 'x'), fromTimestamp);
      left = Math.max(this.uplot.valToPos(fromTimestamp, 'x'), 0);
    }
    if (!toTimestamp) {
      width = Math.round(this.uplot.valToPos(this.end, 'x')) - left;
    } else {
      width = Math.round(this.uplot.valToPos(toTimestamp, 'x')) - left;
    }
    return { left, width, height };
  }

  resetSelect(emitResetEvent = false) {
    // this is a 'hack'. when dblclick is triggered in another synced chart, it will remove the select for the ranger. this function is executed before that.
    // we have to wait the minimum amount of time so that sync event happens, and the selection is destroyed
    setTimeout(() => {
      let left = 0;
      let width = Math.round(this.uplot.valToPos(this.end, 'x')) - left;
      let height = this.uplot.bbox.height / devicePixelRatio;
      this.uplot.setSelect({ left, width, height }, false); // this is just to change the highlight
      let xData = this.uplot.data[0];
      let start = xData[0];
      let end = xData[xData.length - 1];
      this.emitSelectionToLinkedCharts();
      if (emitResetEvent) {
        this.onZoomReset.emit({ from: start, to: end });
      }
    }, 50);
  }

  redrawChart() {
    this.createRanger();
  }

  private createRanger() {
    // @ts-ignore
    let x0;
    let lft0: number;
    let wid0: number;
    // @ts-ignore
    const lftWid = { left: null, width: null };
    // @ts-ignore
    const minMax = { min: null, max: null };

    // @ts-ignore
    let placeDiv = function (par, cls) {
      let el = document.createElement('div');
      el.classList.add(cls);
      par.appendChild(el);
      return el;
    };
    // @ts-ignore
    let on = function (ev, el, fn) {
      el.addEventListener(ev, fn);
    };
    // @ts-ignore
    let off = function (ev, el, fn) {
      el.removeEventListener(ev, fn);
    };
    // @ts-ignore
    let debounce = function (fn) {
      // @ts-ignore
      let raf;
      // @ts-ignore
      return (...args) => {
        // @ts-ignore
        if (raf) return;

        raf = requestAnimationFrame(() => {
          fn(...args);
          raf = null;
        });
      };
    };
    // @ts-ignore
    let bindMove = (e, onMove) => {
      x0 = e.clientX;
      lft0 = this.uplot.select.left;
      wid0 = this.uplot.select.width;

      const _onMove = debounce(onMove);
      on('mousemove', document, _onMove);

      // @ts-ignore
      const _onUp = (e) => {
        off('mouseup', document, _onUp);
        off('mousemove', document, _onMove);

        this.emitSelectionToLinkedCharts();
        this.emitRangeEventIfChanged();

        // viaGrip = false;
      };
      on('mouseup', document, _onUp);

      e.stopPropagation();
    };

    // @ts-ignore
    let setSelect = (newLft, newWid) => {
      lftWid.left = newLft;
      lftWid.width = newWid;
      this.uplot.setSelect(lftWid, false);
    };

    // @ts-ignore
    let zoom = (newLft, newWid) => {
      // minMax.min = this.uplot.posToVal(newLft, 'x');
      // minMax.max = this.uplot.posToVal(newLft + newWid, 'x');
      // uZoomed.setScale('x', minMax);
    };

    // @ts-ignore
    let update = (newLft, newWid) => {
      let newRgt = newLft + newWid;
      let maxRgt = this.uplot.bbox.width / devicePixelRatio;

      if (newLft >= 0 && newRgt <= maxRgt) {
        setSelect(newLft, newWid);
        // zoom(newLft, newWid);
      }
    };
    let select;
    if (this.settings.selection) {
      select = this.transformRangeToSelect(this.settings.selection);
    }
    // console.log('CREATING WITH SELECT: ', this.settings.selection);
    let rangerOpts = {
      width: 800,
      height: 100,
      ms: 1, // if not specified it's going be in seconds
      // select: {left: 0, width: 300, height: 33},
      select: select,
      axes: [
        {},
        {
          show: false,
          scale: 'y',

          grid: { show: false },
        },
      ],
      cursor: {
        y: false,
        points: {
          show: false,
        },
        drag: {
          setScale: false,
          x: true,
          y: false,
        },
        sync: {
          key: this.syncKey,
        },
        bind: {
          // @ts-ignore
          dblclick: (self, b, handler) => {
            return (e: any) => {
              let hasSelection = this.uplot.select.width > 0;
              handler(e);
              if (hasSelection) {
                // has selection
                this.resetSelect(true);
              }
            };
          },
        },
      },
      legend: {
        show: false,
      },
      scales: {
        x: {
          time: true,
        },
      },
      series: [
        {},
        {
          scale: 'y',
          points: { show: false },
          stroke: '#9fd6ff',
          fill: () => {
            let gradient = this.uplot.ctx.createLinearGradient(0, 0, 0, 100);
            gradient.addColorStop(0, '#2e6c7c');
            gradient.addColorStop(1, '#2e6c7c' + '07');
            return gradient;
          },
          // fill: "#9fd6ff"
        },
      ],
      hooks: {
        ready: [
          // @ts-ignore
          (uRanger) => {
            let left = 0;
            let width = Math.round(uRanger.valToPos(this.end, 'x')) - left;
            let height = uRanger.bbox.height / devicePixelRatio;
            if (!this.settings.selection) {
              // we deal with full selection
              uRanger.setSelect({ left, width, height }, false);
            }
            this.previousRange = { from: this.start, to: this.end };
            const sel = uRanger.root.querySelector('.u-select');

            //@ts-ignore
            on('mousedown', sel, (e) => {
              // @ts-ignore
              bindMove(e, (e) => update(lft0 + (e.clientX - x0), wid0));
            });

            // @ts-ignore
            on('mousedown', placeDiv(sel, 'u-grip-l'), (e) => {
              // @ts-ignore
              bindMove(e, (e) => update(lft0 + (e.clientX - x0), wid0 - (e.clientX - x0)));
            });

            // @ts-ignore
            on('mousedown', placeDiv(sel, 'u-grip-r'), (e) => {
              // @ts-ignore
              bindMove(e, (e) => update(lft0, wid0 + (e.clientX - x0)));
            });
          },
        ],
        setSelect: [
          // @ts-ignore
          (uRanger) => {
            // this is triggered when the synced charts are zooming
            // this is triggered many times when clicking on the ranger.
            this.emitRangeEventIfChanged();
            // zoom(uRanger.select.left, uRanger.select.width);
          },
        ],
        setScale: [
          // @ts-ignore
          (uRanger) => {
            // this.onRangeChange.next(this.getCurrentRange());
            // this is triggered when the synced charts are zooming
            // zoom(uRanger.select.left, uRanger.select.width);
          },
        ],
      },
    };
    if (this.uplot) {
      this.uplot.destroy();
    }
    this.uplot = new uPlot(
      rangerOpts,
      [this.settings.xValues, ...this.settings.series.map((s) => s.data)],
      this.chartElement.nativeElement
    );
  }

  emitSelectionToLinkedCharts() {
    let linkedCharts = uPlot.sync(this.syncKey).plots;
    let minMax: any = {
      min: this.uplot.posToVal(this.uplot.select.left, 'x'),
      max: this.uplot.posToVal(this.uplot.select.left + this.uplot.select.width, 'x'),
    };
    // this.uplot.setSelect(minMax);

    linkedCharts.forEach((chart: any) => {
      if (chart === this.uplot) {
        // TODO find a better way to avoid this
        return;
      }
      // minMax.min = this.uplot.min
      // minMax.max = this.uplot.posToVal(newLft + newWid, 'x');
      chart.setScale('x', minMax);
    });
  }

  emitRangeEventIfChanged() {
    let u = this.uplot;
    // we could use just postToVal, but it's better to have an exact value from the X data
    let min = u.data[0][u.valToIdx(u.posToVal(u.select.left, 'x'))];
    let max = u.data[0][u.valToIdx(u.posToVal(u.select.left + u.select.width, 'x'))];
    if (min != this.previousRange?.from || max !== this.previousRange?.to) {
      let currentRange = { from: min, to: max };
      this.previousRange = currentRange;
      this.onRangeChange.next(currentRange);
    }
  }
}
