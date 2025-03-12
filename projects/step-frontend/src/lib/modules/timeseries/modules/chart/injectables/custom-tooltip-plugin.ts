//@ts-ignore
import uPlot = require('uplot');
import { Options } from 'uplot';
import { TooltipAnchor } from '../types/tooltip-anchor';
import { inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { TooltipPlacementFunction } from './tooltip-placement-function';
import { TooltipParentContainer } from '../types/tooltip-parent-container';
import { TooltipContextData } from './tooltip-context-data';
import { TSChartSeries } from '../types/ts-chart-series';
import { TimeSeriesChartComponent } from '../components/time-series-chart/time-series-chart.component';

@Injectable()
export class CustomTooltipPlugin {
  private _doc = inject(DOCUMENT);
  private win = this._doc.defaultView!;

  public static SERIES_NOT_EMPTY_CONDITION_FN = (contextData: TooltipContextData) => {
    for (let i = 0; i < contextData.series.length; i++) {
      let value = contextData.series[i].data[contextData.idx!];
      if (value && value > 0) {
        return true;
      }
    }
    return false;
  };

  /**
   * Execution link can also be displayed in the tooltip. Settings and metadata have to be configured for these links.
   */
  createPlugin(ref: TimeSeriesChartComponent): uPlot.Plugin {
    let chart: uPlot;
    let over: HTMLDivElement;
    let cursorIsOnChartArea = false; // will be changed by onmouseleave and onmouseenter events
    let tooltipActive = false;

    const hideTooltip = () => {
      if (tooltipActive) {
        tooltipActive = false;
        ref.tooltipEvents.emit({ type: 'HIDE' });
      }
    };

    const chartIsLocked = () => {
      //@ts-ignore access the lock state directly in the library
      return chart.cursor._lock;
    };

    return {
      opts: (self: uPlot, opts: Options) => {
        // here we can override the charts settings
        return opts;
      },
      hooks: {
        init: (u: uPlot) => {
          chart = u;
          over = u.over;

          // since the charts are synchronized, the events are called in each chart, so we don't know if we're
          // hovering on one or on the other, so the following events keep track of the active chart.
          over.onclick = () => {
            // @ts-ignore this is how we access the lock state directly in uPlot library
            const lockState = u.cursor._lock;
            ref.lockStateChange.emit(lockState);
          };

          over.onmouseenter = () => {
            cursorIsOnChartArea = true;
            tooltipActive = true;
          };

          over.onmouseleave = () => {
            cursorIsOnChartArea = false;
            if (!chartIsLocked()) {
              hideTooltip();
            }
          };
        },
        destroy: (u: uPlot) => {},
        setSize: (u: uPlot) => {},
        // this event is called on mouse move, and it manipulates the display
        setCursor: (u: uPlot) => {
          //@ts-ignore
          // this is called for all linked charts
          if (chartIsLocked()) {
            return;
          }
          if (!cursorIsOnChartArea) {
            // cursor moving on another chart
            hideTooltip();
            return;
          }
          const { left, top, idx } = u.cursor;
          if (!top || top < 0 || idx === null || left === undefined) {
            // some weird uPlot behaviour. it happens to be -10 many times
            return;
          }
          const idY = u.posToVal(top!, 'y');
          const ySeries = u.series.slice(1) as TSChartSeries[];
          const contextData: TooltipContextData = {
            series: ySeries,
            idx: idx,
            idY: idY,
            //@ts-ignore
            xValues: u.data[0],
            chartRef: u,
            parentRef: ref,
          };

          // Emit event to parent, which will handle positioning using cdkOverlay
          const boundingClientRect = over.getBoundingClientRect();

          //@ts-ignore
          ref.tooltipEvents.emit({
            type: 'POSITION_CHANGED',
            payload: {
              x: left + boundingClientRect.left,
              y: top + boundingClientRect.top,
              data: contextData,
            },
          });
        },
      },
    };
  }
}
