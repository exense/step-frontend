//@ts-ignore
import uPlot = require('uplot');
import { PlacementFunction } from './placement-function';
import { TimeSeriesConfig } from '../time-series.config';
import { TsTooltipOptions } from './model/ts-tooltip-options';
import { TimeSeriesChartComponent } from './time-series-chart.component';

interface TooltipRowEntry {
  value: number;
  name: string;
  color: string;
  executions?: string[];
  bold?: boolean;
}

export interface Anchor {
  left?: number;
  top?: number;
  bottom?: number;
  right?: number;
}

export class TooltipPlugin {
  public static getInstance(ref: TimeSeriesChartComponent): uPlot.Plugin {
    const showExecutionsLinks = ref.settings.showExecutionsLinks;
    let over: any;
    let bound: Element;
    let bLeft: any;
    let bTop: any;
    let isVisible = false;
    let cursorIsOnChartArea = false; // will be changed by onmouseleave and onmouseenter events

    function syncBounds(): void {
      const bbox = over.getBoundingClientRect();
      bLeft = bbox.left;
      bTop = bbox.top;
    }

    const tooltip = document.createElement('div');
    tooltip.id = 'tooltip';
    tooltip.classList.add('ts-tooltip');
    tooltip.style.display = 'none';
    tooltip.style.position = 'absolute';
    document.body.appendChild(tooltip);

    let openMenu: Element | undefined;

    const createExecutionsMenu = (event: any, container: any, executionIds: string[]) => {
      const menu = createElementWithClass('div', 'tooltip-menu');
      menu.innerText = 'Loading...';
      const bounds = container.getBoundingClientRect();
      ref.getExecutionDetails(executionIds).subscribe((executions) => {
        menu.innerText = '';
        executions.forEach((ex) => {
          const row = createElementWithClass('div', 'link-row');
          row.setAttribute('title', 'Show executions');
          row.innerText = `${ex.description!} (${new Date(ex.startTime!).toLocaleString()})`;
          row.addEventListener('click', () => {
            window.open(getExecutionLink(ex.id!));
          });
          menu.appendChild(row);
        });
      });
      menu.style.left = event.clientX - bounds.left + 16 + 'px';
      menu.style.top = event.clientY - bounds.top + 4 + 'px';
      return menu;
    };

    const createRowLeftSection = (row: TooltipRowEntry) => {
      const leftContainer = createElementWithClass('div', 'left');
      const nameDiv = createElementWithClass('div', 'name');
      nameDiv.textContent = `${row.name} `;
      if (row.color) {
        let colorDiv = document.createElement('div');
        colorDiv.classList.add('color');
        colorDiv.style.backgroundColor = row.color;
        leftContainer.appendChild(colorDiv);
      }
      leftContainer.appendChild(nameDiv);
      return leftContainer;
    };

    const createRowRightSection = (row: TooltipRowEntry, yScaleUnit?: string) => {
      const rightContainer = createElementWithClass('div', 'right');
      const valueDiv = createElementWithClass('div', 'value');
      let value = `${Math.trunc(row.value)} `;
      if (yScaleUnit) {
        value += yScaleUnit;
      }
      valueDiv.textContent = value;
      rightContainer.appendChild(valueDiv);
      if (showExecutionsLinks && row.executions?.length) {
        const linkIcon = createElementWithClass('span', 'link-icon');
        linkIcon.setAttribute('title', 'See execution');
        rightContainer.appendChild(linkIcon);
        linkIcon.addEventListener('click', (event) => {
          if (openMenu) {
            tooltip.removeChild(openMenu);
            openMenu = undefined;
          }
          openMenu = createExecutionsMenu(event, tooltip, row.executions!);
          tooltip.appendChild(openMenu);
        });
      }
      return rightContainer;
    };

    const createRowElement = (row: TooltipRowEntry, yScaleUnit?: string): Element => {
      const rowElement = document.createElement('div');
      rowElement.classList.add('tooltip-row');
      if (row.bold) {
        rowElement.setAttribute('style', 'font-weight: bold');
      }
      let leftContainer = createRowLeftSection(row);
      let rightContainer = createRowRightSection(row, yScaleUnit);

      rowElement.appendChild(leftContainer);
      rowElement.appendChild(rightContainer);

      return rowElement;
    };

    const createDotsSeparator = () => {
      let dots = document.createElement('div');
      dots.classList.add('dots');
      dots.textContent = '...';
      return dots;
    };

    const tooltipOnMouseLeaveEvent = () => {
      console.log('TOOLTIP LEFT');
      if (!cursorIsOnChartArea) {
        tooltip.style.display = 'none';
        isVisible = false;
      }
      tooltip.removeEventListener('mouseleave', tooltipOnMouseLeaveEvent);
    };

    return {
      hooks: {
        init: (u: uPlot) => {
          over = u.over;

          bound = over;
          //	bound = document.body;

          over.onmouseenter = () => {
            console.log('on mouse enter');
            tooltip.style.display = 'block';
            cursorIsOnChartArea = true;
            isVisible = true;
          };

          over.onmouseleave = (event: any) => {
            if (event.relatedTarget?.id === 'tooltip') {
              console.log('LEAVING THROUGH TOOLTIP');
              tooltip.addEventListener('mouseleave', tooltipOnMouseLeaveEvent);
            }
            // if (!over.contains(event.relatedTarget)) {
            //   console.log('YES');
            // }
            const tooltipRect = tooltip.getBoundingClientRect();
            const chartRect = over.getBoundingClientRect();
            console.log(chartRect.right, event.clientX);
            const isOverTooltip =
              event.clientX > tooltipRect.left &&
              event.clientX < tooltipRect.right &&
              event.clientY > tooltipRect.top &&
              event.clientY < tooltipRect.bottom;

            const isOverChart =
              event.clientX > chartRect.left &&
              event.clientX < chartRect.right &&
              event.clientY > chartRect.top &&
              event.clientY < chartRect.bottom;
            if (!isOverChart) {
              cursorIsOnChartArea = false;
              // no need to hide the tooltip because the cursor may be over it
            }

            console.log('on mouse leave', isOverChart, isOverTooltip);

            if (!isOverTooltip && !isOverChart) {
              // Hide the tooltip
              tooltip.style.display = 'none';
              isVisible = false;
              if (openMenu) {
                tooltip.removeChild(openMenu);
                openMenu = undefined;
              }
            }
          };
        },
        destroy: (u: uPlot) => {
          tooltip.remove();
        },
        setSize: (u: uPlot) => {
          syncBounds();
          // @ts-ignore
          console.log('cursor', u.cursor._lock);
        },
        setCursor: (u: uPlot) => {
          // this is called for all linked charts

          if (!isVisible) {
            return;
          }
          const settings = ref!.settings.tooltipOptions;
          const { left, top, idx } = u.cursor;
          if (!top || top < 0 || !idx || !left) {
            // some weird uPlot behaviour. it happens to be -10 many times
            return;
          }
          let hoveredValue = u.posToVal(top, 'y');
          let yPoints: TooltipRowEntry[] = [];
          let summaryRow: TooltipRowEntry | undefined;
          for (let i = 1; i < u.series.length; i++) {
            let series = u.series[i];
            let bucketValue = u.data[i][idx];
            if (series.scale === 'y' && series.show) {
              if (bucketValue != undefined) {
                const executionIds = ref.chartMetadata[i]?.[idx]?.['eId'];
                yPoints.push({
                  value: bucketValue,
                  name: series.label || '',
                  // @ts-ignore
                  color: series._stroke,
                  executions: executionIds,
                });
              }
              continue;
            }
            if (series.scale === 'total' && bucketValue != null) {
              summaryRow = {
                value: bucketValue,
                color: TimeSeriesConfig.TOTAL_BARS_COLOR,
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
            tooltip.style.zIndex = '-1';
            return; // there is no data to show
          } else {
            tooltip.style.zIndex = '1000';
          }
          tooltip.innerHTML = '';
          yPoints.forEach((point) => {
            let rowElement = createRowElement(point, settings.yAxisUnit);
            tooltip.appendChild(rowElement);
          });
          if (yPoints.length < allSeriesLength) {
            if (elipsisBefore) {
              tooltip.prepend(createDotsSeparator());
            }
            if (elipsisAfter) {
              tooltip.appendChild(createDotsSeparator());
            }
          }
          if (summaryRow) {
            let summaryElement = createRowElement(summaryRow);

            tooltip.appendChild(this.createSeparator());
            tooltip.appendChild(summaryElement);
          }

          let timestamp = u.posToVal(left, 'x');
          tooltip.appendChild(this.createSeparator());
          tooltip.appendChild(this.createTimestampItem(timestamp));

          // there is no easy way to cache these. when the div gets smaller without a resize, the bbox is not updated.
          let boundingClientRect = over.getBoundingClientRect();

          const anchor: Anchor = { left: left + boundingClientRect.left, top: top + boundingClientRect.top };
          // tooltip.textContent = `${x} at ${Math.round(left)},${Math.round(top)}`;
          let container = this.getAdjustedBoundaries(bound);
          PlacementFunction.placement(tooltip, anchor, 'right', 'start', container);
        },
      },
    };
  }

  private static createSeparator() {
    let separator = document.createElement('div');
    separator.classList.add('separator');
    return separator;
  }

  private static createTimestampItem(timestamp: number) {
    let date = new Date(timestamp);
    let div = document.createElement('div');
    div.textContent = date.toLocaleString();
    div.classList.add('timestamp');
    return div;
  }

  private static getAdjustedBoundaries(element: Element) {
    const rect = element.getBoundingClientRect();
    let shiftUp = 0; // positive value when need to avoid scroll

    if (rect.bottom > window.innerHeight) {
      shiftUp = rect.bottom - window.innerHeight;
    }

    return {
      top: rect.top - shiftUp,
      bottom: rect.bottom - shiftUp,
      left: 0,
      right: window.innerWidth,
      width: window.innerWidth,
      height: rect.height,
    };
  }

  private static getClosestIndex(num: number, arr: TooltipRowEntry[]): number {
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
}

const createElementWithClass = (element: string, className: string) => {
  const dom = document.createElement(element);
  dom.classList.add(className);
  return dom;
};

const getExecutionLink = (executionId: string) => `#/root/executions/${executionId}/viz`;
