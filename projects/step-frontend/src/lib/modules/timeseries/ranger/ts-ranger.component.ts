import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { TSRangerSettings } from './ts-ranger-settings';
import { UplotSyncService } from '../chart/uplot-sync-service';
import { TSTimeRange } from '../chart/model/ts-time-range';
import { UPlotUtils } from '../uplot/uPlot.utils';
import { timeout } from 'rxjs';

declare const uPlot: any;

@Component({
  selector: 'step-ts-ranger',
  templateUrl: './ts-ranger.component.html',
  styleUrls: ['./ts-ranger.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TSRangerComponent implements OnInit, AfterViewInit {
  @ViewChild('chart') private chartElement!: ElementRef;

  @Input('settings') settings!: TSRangerSettings;
  @Input('syncKey') syncKey: string | undefined;

  @Output('onRangeChange') onRangeChange = new EventEmitter<TSTimeRange>();

  uplot!: any;
  previousRange: TSTimeRange | undefined;

  start!: number;
  end!: number;

  ngOnInit(): void {
    if (this.syncKey) {
      uPlot.sync(this.syncKey);
    }
    this.start = this.settings.xValues[0];
    this.end = this.settings.xValues[this.settings.xValues.length - 1];
  }

  ngAfterViewInit(): void {
    this.createRanger();
  }

  resetSelect() {
    // this is a 'hack'. when dblclick is triggered in another synced chart, it will remove the select for the ranger. this function is executed before that.
    // we have to wait the minimum amount of time so that sync event happens, and the selection is destroyed
    setTimeout(() => {
      let left = Math.round(this.uplot.valToPos(this.start, 'x'));
      let width = Math.round(this.uplot.valToPos(this.end, 'x')) - left;
      let height = this.uplot.bbox.height / devicePixelRatio;
      this.uplot.setSelect({ left, width, height }, false);
      let xData = this.uplot.data[0];
      let start = xData[0];
      let end = xData[xData.length - 1];
      this.onRangeChange.emit({ start, end });
    }, 50);
  }

  createRanger() {
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
        let linkedCharts = uPlot.sync(this.syncKey).plots;
        let minMax: any = {
          min: this.uplot.posToVal(this.uplot.select.left, 'x'),
          max: this.uplot.posToVal(this.uplot.select.left + this.uplot.select.width, 'x'),
        };
        this.emitRangeEventIfChanged();
        linkedCharts.forEach((chart: any) => {
          if (chart === this.uplot) {
            // TODO find a better way to avoid this
            return;
          }
          // minMax.min = this.uplot.min
          // minMax.max = this.uplot.posToVal(newLft + newWid, 'x');
          chart.setScale('x', minMax);
        });

        // viaGrip = false;
      };
      on('mouseup', document, _onUp);

      e.stopPropagation();
    };

    // @ts-ignore
    let select = (newLft, newWid) => {
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
        select(newLft, newWid);
        zoom(newLft, newWid);
      }
    };

    let rangerOpts = {
      width: 800,
      height: 100,
      ms: 1, // if not specified it's going be in seconds
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
                this.resetSelect();
              }
            };
          },
        },
      },
      legend: {
        show: false,
      },
      scales: {},
      series: [
        {},
        {
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
            let left = Math.round(uRanger.valToPos(this.start, 'x'));
            let width = Math.round(uRanger.valToPos(this.end, 'x')) - left;
            let height = uRanger.bbox.height / devicePixelRatio;
            uRanger.setSelect({ left, width, height }, false);
            this.previousRange = { start: this.start, end: this.end };
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
    this.uplot = new uPlot(
      rangerOpts,
      [this.settings.xValues, ...this.settings.series.map((s) => s.data)],
      this.chartElement.nativeElement
    );
  }

  emitRangeEventIfChanged() {
    let u = this.uplot;
    let min = u.posToVal(u.select.left, 'x');
    let max = u.posToVal(u.select.left + u.select.width, 'x');
    if (min != this.previousRange?.start || max !== this.previousRange?.end) {
      let currentRange = { start: min, end: max };
      this.previousRange = currentRange;
      this.onRangeChange.next(currentRange);
    }
  }
}
