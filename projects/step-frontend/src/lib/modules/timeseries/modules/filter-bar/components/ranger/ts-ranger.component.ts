import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { TSRangerSettings } from './ts-ranger-settings';

//@ts-ignore
import uPlot = require('uplot');
import MouseListener = uPlot.Cursor.MouseListener;
import { TimeRange } from '@exense/step-core';
import { COMMON_IMPORTS, TimeSeriesConfig, UPlotUtilsService } from '../../../_common';
import { DOCUMENT } from '@angular/common';
import UPlot from '../../../_common/types/uPlot';

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
  standalone: true,
  imports: [COMMON_IMPORTS],
})
export class TSRangerComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  private _element = inject(ElementRef);
  private _doc = inject(DOCUMENT);
  private _utils = inject(UPlotUtilsService);

  private readonly CHART_HEIGHT = 104;

  @ViewChild('chart') private chartElement!: ElementRef;

  @Input() settings!: TSRangerSettings;
  @Input() syncKey!: string;

  /**
   * This should emit the following events only:
   * 1. when a synced chart or this chart is zooming
   * 2. when the grips are moved
   */
  @Output() rangeChange = new EventEmitter<TimeRange>();

  @Output() zoomReset = new EventEmitter<TimeRange>();

  @Output() chartLoaded = new EventEmitter<void>();

  uplot!: UPlot;
  previousRange: TimeRange | undefined;

  start!: number;
  end!: number;

  getSize = () => {
    return {
      width: this._element.nativeElement.parentElement.offsetWidth,
      height: this.CHART_HEIGHT,
    };
  };

  ngOnDestroy(): void {
    this.uplot?.destroy();
  }

  redraw(): void {
    this.uplot.setData(this.uplot.data);
    this.uplot.setSize(this.getSize());
  }

  ngOnInit(): void {
    if (this.syncKey) {
      uPlot.sync(this.syncKey);
    }
    this.init(this.settings);
  }

  ngAfterViewInit(): void {
    this.createRanger();
  }

  resizeChart() {
    const chartPadding = 50; // this is the way uplot works
    const fullWidth = this.uplot.width - chartPadding;
    const leftSelect = this.uplot.select.left;
    const width = this.uplot.select.width;
    const rightSelect = leftSelect + width;
    const leftPercent = (100 * leftSelect) / fullWidth;
    const rightPercent = (100 * rightSelect) / fullWidth;
    this.uplot.setSize(this.getSize());
    let newChartWidth = this.uplot.width - chartPadding;

    const newLeft = (leftPercent / 100) * newChartWidth;
    const newRight = (rightPercent / 100) * newChartWidth;
    this.uplot.setSelect({ left: newLeft, width: newRight - newLeft, top: 0, height: this.CHART_HEIGHT }, false);
  }

  init(settings: TSRangerSettings) {
    this.start = settings.xValues[0];
    this.end = settings.xValues[this.settings.xValues.length - 1];
  }

  ngOnChanges(changes: SimpleChanges): void {
    const settings = changes['settings'];
    if (settings && settings.previousValue) {
      // it's a real change
      this.init(settings.currentValue);
      this.createRanger();
    }
  }

  selectRange(range: TimeRange) {
    const select = this.transformRangeToSelect(range);
    this.uplot.setSelect(select, false);
    this.emitSelectionToLinkedCharts();
  }

  transformRangeToSelect(range: TimeRange): uPlot.Select {
    const fromTimestamp = range.from;
    const toTimestamp = range.to;
    let left, width;
    const height = this.uplot.bbox.height / devicePixelRatio;
    left = this.uplot.valToPos(fromTimestamp, 'x');
    left = Math.max(left, 0); // in case it is negative
    width = this.uplot.valToPos(toTimestamp, 'x') - left;
    // by some reasons, sometimes relative selection get out of the canvas
    if (left + width > this.uplot.bbox.width) {
      width = this.uplot.bbox.width - left;
    }

    return { left, width, height, top: 0 };
  }

  resetSelect(emitResetEvent = false) {
    // this is a 'hack'. when dblclick is triggered in another synced chart, it will remove the select for the ranger. this function is executed before that.
    // we have to wait the minimum amount of time so that sync event happens, and the selection is destroyed
    setTimeout(() => {
      const left = 0;
      const width = Math.round(this.uplot.valToPos(this.end, 'x')) - left;
      const height = this.uplot.bbox.height / devicePixelRatio;
      this.uplot.setSelect({ left, width, height, top: this.uplot.select.top }, false); // this is just to change the highlight
      const xData = this.uplot.data[0];
      const start = xData[0];
      const end = xData[xData.length - 1];
      this.emitSelectionToLinkedCharts();
      if (emitResetEvent) {
        this.zoomReset.emit({ from: start, to: end });
      }
    }, 50);
  }

  private createRanger() {
    let x0: number;
    let lft0: number;
    let wid0: number;

    const placeDiv = (par: Element, cls: string) => {
      let el = this._doc.createElement('div');
      el.classList.add(cls);
      par.appendChild(el);
      return el;
    };

    const on = (ev: string, el: Node, fn: (event: MouseEvent) => void) => {
      el.addEventListener(ev, fn as EventListenerOrEventListenerObject);
    };
    const off = (ev: string, el: Node, fn: (event: MouseEvent) => void) => {
      el.removeEventListener(ev, fn as EventListenerOrEventListenerObject);
    };
    const debounce = (fn: Function) => {
      let raf: number | null;
      return (...args: unknown[]) => {
        if (raf) return;

        raf = requestAnimationFrame(() => {
          fn(...args);
          raf = null;
        });
      };
    };
    const bindMove = (e: MouseEvent, onMove: (event: MouseEvent) => void) => {
      x0 = e.clientX;
      lft0 = this.uplot.select.left;
      wid0 = this.uplot.select.width;

      const _onMove = debounce(onMove);
      on('mousemove', document, _onMove);

      const _onUp = (e: MouseEvent) => {
        off('mouseup', document, _onUp);
        off('mousemove', document, _onMove);

        this.emitSelectionToLinkedCharts();
        this.emitRangeEventIfChanged();

        // viaGrip = false;
      };
      on('mouseup', document, _onUp);

      e.stopPropagation();
    };

    const setSelect = (left: number, width: number) => {
      const top = this.uplot.select.top;
      const height = this.uplot.select.height;
      this.uplot.setSelect({ top, left, height, width }, false);
    };

    const update = (newLft: number, newWid: number) => {
      let newRgt = newLft + newWid;
      let maxRgt = this.uplot.bbox.width / devicePixelRatio;

      if (newLft >= 0 && newRgt <= maxRgt) {
        setSelect(newLft, newWid);
      }
    };

    let rangerOpts: uPlot.Options = {
      ...this.getSize(),
      ms: 1, // if not specified it's going be in seconds
      // select: {left: 0, width: 300, height: 33},
      // select: select,
      axes: [
        {
          grid: {
            width: 1,
          },
        },
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
          // this is not trigger when dblclick is fired on synced charts, but just on the ranger
          dblclick: (self: uPlot, b, handler: MouseListener) => {
            return (e: MouseEvent) => {
              let hasSelection = this.uplot.select.width > 0;
              handler(e);
              if (hasSelection) {
                // has selection
                this.zoomReset.emit();
                // this.resetSelect(true);
              }
              return null;
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
          fill: TimeSeriesConfig.RANGER_COLORS.series,
        },
      ],
      hooks: {
        ready: [
          (uRanger: uPlot) => {
            const left = 0;
            const width = Math.round(uRanger.valToPos(this.end, 'x')) - left;
            const height = uRanger.bbox.height / devicePixelRatio;
            if (!this.settings.selection) {
              // we deal with full selection
              uRanger.setSelect({ left, width, height, top: 0 }, false);
            } else {
              uRanger.setSelect(this.transformRangeToSelect(this.settings.selection));
            }
            this.previousRange = { from: this.start, to: this.end };
            const sel = uRanger.root.querySelector('.u-select')!;

            on('mousedown', sel, (event: MouseEvent) => {
              bindMove(event, (e: MouseEvent) => update(lft0 + (e.clientX - x0), wid0));
            });

            on('mousedown', placeDiv(sel, 'u-grip-l'), (event: MouseEvent) => {
              bindMove(event, (e: MouseEvent) => update(lft0 + (e.clientX - x0), wid0 - (e.clientX - x0)));
            });

            on('mousedown', placeDiv(sel, 'u-grip-r'), (event: MouseEvent) => {
              bindMove(event, (e: MouseEvent) => update(lft0, wid0 + (e.clientX - x0)));
            });
          },
        ],
        setSelect: [
          (uRanger: uPlot) => {
            // this is triggered when the synced charts are zooming
            // this is triggered many times when clicking on the ranger.
            this.emitRangeEventIfChanged();
            // zoom(uRanger.select.left, uRanger.select.width);
          },
        ],
        setScale: [
          (uRanger: uPlot) => {
            // this.onRangeChange.next(this.getCurrentRange());
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
      this.chartElement.nativeElement,
    ) as unknown as UPlot;
    this.chartLoaded.emit();
  }

  emitSelectionToLinkedCharts() {
    const linkedCharts = uPlot.sync(this.syncKey).plots;
    const minMax = {
      min: this.uplot.posToVal(this.uplot.select.left, 'x'),
      max: this.uplot.posToVal(this.uplot.select.left + this.uplot.select.width, 'x'),
    };

    linkedCharts.forEach((chart: any) => {
      if (chart === this.uplot) {
        // TODO find a better way to avoid this
        return;
      }
      chart.setScale('x', minMax);
    });
  }

  emitRangeEventIfChanged() {
    const u = this.uplot;
    // keep these lines below if it's better to have an exact value from the X data
    // let min = u.data[0][u.valToIdx(u.posToVal(u.select.left, 'x'))];
    // let max = u.data[0][u.valToIdx(u.posToVal(u.select.left + u.select.width, 'x'))];
    const min = u.posToVal(u.select.left, 'x');
    const max = u.posToVal(u.select.left + u.select.width, 'x');
    if (min != this.previousRange?.from || max !== this.previousRange?.to) {
      const currentRange = { from: min, to: max };
      this.previousRange = currentRange;
      this.rangeChange.emit(currentRange);
    }
  }
}
