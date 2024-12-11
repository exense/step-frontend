//@ts-ignore
import uPlot = require('uplot');
import { Options } from 'uplot';
import { TooltipRowEntry } from '../types/tooltip-row-entry';
import { TimeSeriesConfig } from '../../_common';
import { TooltipAnchor } from '../types/tooltip-anchor';
import { inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ExecutionsService, MarkerType } from '@exense/step-core';
import { TooltipPlacementFunction } from './tooltip-placement-function';
import { TooltipParentContainer } from '../types/tooltip-parent-container';
import { SeriesStroke } from '../../_common/types/time-series/series-stroke';

@Injectable()
export class TooltipPlugin {
  private _doc = inject(DOCUMENT);
  private win = this._doc.defaultView!;
  private _executionsService = inject(ExecutionsService);
  private domParser = new DOMParser();

  /**
   * Execution link can also be displayed in the tooltip. Settings and metadata have to be configured for these links.
   */
  createPlugin(ref: TooltipParentContainer): uPlot.Plugin {
    const showExecutionsLinks = ref.settings.tooltipOptions?.useExecutionLinks;
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

    const createRowRightSection = (row: TooltipRowEntry, yScaleUnit?: string) => {
      const rightContainer = this.createElementWithClass('div', 'right');
      const valueDiv = this.createElementWithClass('div', 'value');
      let value = `${Math.trunc(row.value)} `;
      if (yScaleUnit) {
        value += yScaleUnit;
      }
      valueDiv.textContent = value;
      rightContainer.appendChild(valueDiv);
      if (showExecutionsLinks && row.executions?.length) {
        const linkIcon = this.createElementWithClass('span', 'link-icon');
        linkIcon.setAttribute('title', 'See execution');
        rightContainer.appendChild(linkIcon);
        linkIcon.addEventListener('click', (event: MouseEvent) => {
          event.stopPropagation(); // the menu has a listener already
          if (openMenu) {
            openMenu.remove();
            openMenu = undefined;
          }
          openMenu = this.createExecutionsMenu(event, tooltip, row.executions!);
          tooltip.appendChild(openMenu);
        });
      }
      return rightContainer;
    };

    const createRowElement = (row: TooltipRowEntry, yScaleUnit?: string): Element => {
      const rowElement = this._doc.createElement('div');
      rowElement.classList.add('tooltip-row');
      if (row.bold) {
        rowElement.setAttribute('style', 'font-weight: bold');
      }
      const leftContainer = this.createRowLeftSection(row);
      const rightContainer = createRowRightSection(row, yScaleUnit);

      rowElement.appendChild(leftContainer);
      rowElement.appendChild(rightContainer);

      return rowElement;
    };

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

          const settings = ref.settings.tooltipOptions;
          const { left, top, idx } = u.cursor;
          if (!top || top < 0 || !idx || !left) {
            // some weird uPlot behaviour. it happens to be -10 many times
            return;
          }
          const hoveredValue = u.posToVal(top, 'y');
          let yPoints: TooltipRowEntry[] = [];
          let summaryRow: TooltipRowEntry | undefined;
          // first series is x axis (time)
          for (let i = 1; i < u.series.length; i++) {
            const series = u.series[i];
            const bucketValue = u.data[i][idx];
            if (series.scale !== TimeSeriesConfig.SECONDARY_AXES_KEY && series.show) {
              if (bucketValue != undefined) {
                const executionIds = ref.chartMetadata[i]?.[idx]?.[TimeSeriesConfig.EXECUTION_ID_ATTRIBUTE];
                yPoints.push({
                  value: bucketValue,
                  name: series.label || '',
                  // @ts-ignore
                  stroke: series.strokeConfig,
                  executions: executionIds,
                });
              }
              continue;
            }
            if (series.scale === TimeSeriesConfig.SECONDARY_AXES_KEY && bucketValue != null) {
              summaryRow = {
                value: bucketValue,
                stroke: { color: TimeSeriesConfig.TOTAL_BARS_COLOR, type: MarkerType.SQUARE },
                name: settings.zAxisLabel || 'Total',
              };
            }
          }
          yPoints.sort((a, b) => (a.value - b.value) * -1);
          const allSeriesLength = yPoints.length;
          const elementsToSelect = 5;
          let elipsisBefore = true;
          let elipsisAfter = true;
          const closestIndex = this.getClosestIndex(hoveredValue, yPoints);
          if (closestIndex >= 0) {
            yPoints[closestIndex].bold = true;
          }
          if (yPoints.length > elementsToSelect) {
            if (closestIndex < elementsToSelect / 2) {
              yPoints = yPoints.slice(0, elementsToSelect);
              elipsisBefore = false;
            } else if (yPoints.length - closestIndex < elementsToSelect / 2) {
              yPoints = yPoints.slice(-elementsToSelect);
              elipsisAfter = false;
            } else {
              yPoints = yPoints.slice(closestIndex - elementsToSelect / 2, closestIndex + elementsToSelect / 2);
            }
          }
          if (yPoints.length === 0) {
            // tooltip.style.zIndex = '-1';
            return; // there is no data to show
          } else {
            tooltip.style.zIndex = '1000';
          }
          tooltip.innerHTML = '';
          yPoints.forEach((point) => {
            const rowElement = createRowElement(point, settings.yAxisUnit);
            tooltip.appendChild(rowElement);
          });
          if (yPoints.length < allSeriesLength) {
            if (elipsisBefore) {
              tooltip.prepend(this.createDotsSeparator());
            }
            if (elipsisAfter) {
              tooltip.appendChild(this.createDotsSeparator());
            }
          }
          if (summaryRow) {
            const summaryElement = createRowElement(summaryRow);

            tooltip.appendChild(this.createSeparator());
            tooltip.appendChild(summaryElement);
          }

          const timestamp = u.posToVal(left, 'x');
          tooltip.appendChild(this.createSeparator());
          tooltip.appendChild(this.createTimestampItem(timestamp));

          // there is no easy way to cache these. when the div gets smaller without a resize, the bbox is not updated.
          const boundingClientRect = over.getBoundingClientRect();

          const anchor: TooltipAnchor = { left: left + boundingClientRect.left, top: top + boundingClientRect.top };
          // tooltip.textContent = `${x} at ${Math.round(left)},${Math.round(top)}`;
          const container = this.getAdjustedBoundaries(bound);
          TooltipPlacementFunction.placement(tooltip, anchor, 'right', 'start', container);
        },
      },
    };
  }

  private createTooltipElement() {
    const tooltip = this.createElementWithClass('div', 'ts-tooltip');
    tooltip.id = 'tooltip';
    tooltip.style.display = 'none';
    tooltip.style.position = 'absolute';
    return tooltip;
  }

  private createExecutionsMenu = (event: MouseEvent, tooltipContainer: HTMLElement, executionIds: string[]) => {
    const menu = this.createElementWithClass('div', 'tooltip-menu');
    menu.innerText = 'Loading...';
    const tooltipBounds = tooltipContainer.getBoundingClientRect();
    let computedLeft = event.clientX - tooltipBounds.left + 16;
    const computedTop = event.clientY - tooltipBounds.top + 4;
    const estimatedWidthOfExecutionLabel = 150;
    if (event.clientX + 16 + estimatedWidthOfExecutionLabel > this.win.innerWidth) {
      computedLeft -= estimatedWidthOfExecutionLabel;
    }
    menu.style.left = computedLeft + 'px';
    menu.style.top = computedTop + 'px';
    this._executionsService.getExecutionsByIds(executionIds).subscribe((executions) => {
      menu.innerText = '';
      executions.forEach((ex) => {
        const row = this.createElementWithClass('div', 'link-row');
        row.setAttribute('title', 'Show executions');
        row.innerText = `${ex.description!} (${new Date(ex.startTime!).toLocaleString()})`;
        row.addEventListener('click', () => {
          this.win.open(getExecutionLink(ex.id!));
        });
        menu.appendChild(row);
      });
      let menuRightBound = menu.getBoundingClientRect().right;
      if (menuRightBound > this.win.innerWidth) {
        menu.style.left = computedLeft - (menuRightBound - this.win.innerWidth) - 16 + 'px';
      }
    });

    return menu;
  };

  private createRowLeftSection(row: TooltipRowEntry) {
    const leftContainer = this.createElementWithClass('div', 'left');
    const nameDiv = this.createElementWithClass('div', 'name');
    nameDiv.textContent = `${row.name} `;
    if (row.stroke) {
      const marker = this.createMarker(row.stroke);
      leftContainer.appendChild(marker);
    }
    leftContainer.appendChild(nameDiv);
    return leftContainer;
  }

  private createMarker(stroke: SeriesStroke): HTMLDivElement {
    const container = document.createElement('div');
    container.style.margin = '0 0.4rem';
    switch (stroke.type) {
      case MarkerType.SQUARE:
        container.innerHTML = `<div class="step-marker-filled-square" style="--item-color: ${stroke.color}"></div>`;
        break;
      case MarkerType.DOTS:
        container.innerHTML = `<div class="step-marker-dots" style="--item-color: ${stroke.color}"></div>`;
        break;
      case MarkerType.DASHED:
        container.innerHTML = `<div class="step-marker-dashed-square" style="--item-color: ${stroke.color}"></div>`;
        break;
    }
    return container;
  }

  private createSeparator(): HTMLDivElement {
    const separator = this._doc.createElement('div');
    separator.classList.add('separator');
    return separator;
  }

  private createTimestampItem(timestamp: number): HTMLDivElement {
    const date = new Date(timestamp);
    const div = this._doc.createElement('div');
    div.textContent = date.toLocaleString();
    div.classList.add('timestamp');
    return div;
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

  private getClosestIndex(num: number, arr: TooltipRowEntry[]): number {
    if (!arr || arr.length === 0) {
      return -1;
    }
    let curr = arr[0];
    let diff = Math.abs(num - curr.value);
    let index = 0;
    for (let val = 0; val < arr.length; val++) {
      let newdiff = Math.abs(num - arr[val].value);

      if (newdiff < diff) {
        diff = newdiff;
        curr = arr[val];
        index = val;
      }
    }
    return index;
  }

  private createElementWithClass(element: string, className: string): HTMLElement {
    const dom = this._doc.createElement(element);
    dom.classList.add(className);
    return dom;
  }

  private createDotsSeparator() {
    const dots = this._doc.createElement('div');
    dots.classList.add('dots');
    dots.textContent = '...';
    return dots;
  }
}

const getExecutionLink = (executionId: string) => `#/executions/${executionId}/viz`;
