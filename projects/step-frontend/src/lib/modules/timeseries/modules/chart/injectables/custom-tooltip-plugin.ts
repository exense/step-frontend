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
  createPlugin(
    ref: TooltipParentContainer,
    renderContent: (container: any, data: TooltipContextData) => boolean,
  ): uPlot.Plugin {
    let chart: uPlot;
    let over: HTMLDivElement;
    let bound: Element;
    let bLeft: number;
    let bTop: number;
    let cursorIsOnChartArea = false; // will be changed by onmouseleave and onmouseenter events

    function syncBounds(): void {
      const bbox = over.getBoundingClientRect();
      bLeft = bbox.left;
      bTop = bbox.top;
    }

    const hideTooltip = () => {
      tooltip.style.display = 'none';
    };

    const showTooltip = () => {
      tooltip.style.display = 'block';
    };

    const tooltip = this.createTooltipElement();
    this._doc.body.appendChild(tooltip);

    let openMenu: Element | undefined;

    tooltip.addEventListener('click', () => {
      openMenu?.remove();
    });

    const chartIsLocked = () => {
      //@ts-ignore
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

          bound = over;

          // since the charts are synchronized, the events are called in each chart, so it's difficult to know if we're
          // hovering on one or on the other, so the following events keep track of the active chart.
          over.onclick = () => {
            // @ts-ignore
            const lockState = u.cursor._lock;
            ref.lockStateChange.emit(lockState);
          };

          over.onmouseenter = () => {
            cursorIsOnChartArea = true;
            if (chartIsLocked()) {
              return;
            }
          };

          over.onmouseleave = () => {
            cursorIsOnChartArea = false;
            if (!chartIsLocked()) {
              hideTooltip();
            }
          };
        },
        destroy: (u: uPlot) => {
          tooltip?.remove();
        },
        setSize: (u: uPlot) => {
          syncBounds();
        },
        // this event is called on mouse move, and it manipulates the display
        setCursor: (u: uPlot) => {
          // this is called for all linked charts
          if (chartIsLocked()) {
            return;
          } else {
            if (!cursorIsOnChartArea) {
              // the cursor is moving on another chart
              hideTooltip();
            } else {
              showTooltip();
            }
          }
          if (!cursorIsOnChartArea) {
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
          let shouldBeVisible = renderContent(tooltip, contextData);
          if (!shouldBeVisible) {
            hideTooltip();
            return;
          }

          // there is no easy way to cache these. when the div gets smaller without a resize, the bbox is not updated.
          const boundingClientRect = over.getBoundingClientRect();

          const anchor: TooltipAnchor = { left: left + boundingClientRect.left, top: top + boundingClientRect.top };
          const container = this.getAdjustedBoundaries(bound);
          TooltipPlacementFunction.placement(tooltip, anchor, 'right', 'start', container);
        },
      },
    };
  }

  private createTooltipElement() {
    const tooltip = this.createElementWithClass('div', 'ts-tooltip');
    tooltip.onclick = (e) => e.stopPropagation();
    tooltip.style.display = 'none';
    tooltip.style.position = 'absolute';
    return tooltip;
  }

  private getAdjustedBoundaries(element: Element) {
    const rect = element.getBoundingClientRect();
    let shiftUp = 0; // positive value when need to avoid scroll

    if (rect.bottom > this.win.innerHeight) {
      shiftUp = rect.bottom - this.win.innerHeight;
    }

    return {
      top: rect.top - shiftUp,
      bottom: rect.bottom - shiftUp,
      left: 0,
      right: this.win.innerWidth,
      width: this.win.innerWidth,
      height: rect.height,
    };
  }

  private createElementWithClass(element: string, className: string): HTMLElement {
    const dom = this._doc.createElement(element);
    dom.classList.add(className);
    return dom;
  }
}
