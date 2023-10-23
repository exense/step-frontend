//@ts-ignore
import uPlot = require('uplot');
import { PlacementFunction } from './placement-function';
import { TimeSeriesConfig } from '../time-series.config';
import { TsTooltipOptions } from './model/ts-tooltip-options';

interface TooltipRowEntry {
  value: number;
  name: string;
  color: string;
  bold?: boolean;
}

export interface Anchor {
  left?: number;
  top?: number;
  bottom?: number;
  right?: number;
}

export class TooltipPlugin {
  public static getInstance(optionsGetter: () => TsTooltipOptions): uPlot.Plugin {
    let over: any;
    let bound: Element;
    let bLeft: any;
    let bTop: any;
    let isVisible = false;

    function syncBounds(): void {
      const bbox = over.getBoundingClientRect();
      bLeft = bbox.left;
      bTop = bbox.top;
    }

    const overlay = document.createElement('div');
    overlay.id = 'overlay';
    overlay.classList.add('ts-tooltip');
    overlay.style.display = 'none';
    overlay.style.position = 'absolute';
    document.body.appendChild(overlay);

    return {
      hooks: {
        init: (u: uPlot) => {
          over = u.over;

          bound = over;
          //	bound = document.body;

          over.onmouseenter = () => {
            overlay.style.display = 'block';
            isVisible = true;
          };

          over.onmouseleave = () => {
            overlay.style.display = 'none';
            isVisible = false;
          };
        },
        destroy: (u: uPlot) => {
          overlay.remove();
        },
        setSize: (u: uPlot) => {
          syncBounds();
        },
        setCursor: (u: uPlot) => {
          // this is called for all linked charts
          if (!isVisible) {
            return;
          }
          const settings = optionsGetter();
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
                // @ts-ignore
                yPoints.push({ value: bucketValue, name: series.label, color: series._stroke });
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
            overlay.style.zIndex = '-1';
            return; // there is no data to show
          } else {
            overlay.style.zIndex = '1000';
          }
          overlay.innerHTML = '';
          yPoints.forEach((point) => {
            let rowElement = this.createRowElement(point, settings.yAxisUnit);
            overlay.appendChild(rowElement);
          });
          if (yPoints.length < allSeriesLength) {
            if (elipsisBefore) {
              let dots = document.createElement('div');
              dots.classList.add('dots');
              dots.textContent = '...';
              overlay.prepend(dots);
            }
            if (elipsisAfter) {
              let dots = document.createElement('div');
              dots.classList.add('dots');
              dots.textContent = '...';
              overlay.appendChild(dots);
            }
          }
          if (summaryRow) {
            let summaryElement = this.createRowElement(summaryRow);

            overlay.appendChild(this.createSeparator());
            overlay.appendChild(summaryElement);
          }

          let timestamp = u.posToVal(left, 'x');
          overlay.appendChild(this.createSeparator());
          overlay.appendChild(this.createTimestampItem(timestamp));

          // there is no easy way to cache these. when the div gets smaller without a resize, the bbox is not updated.
          let boundingClientRect = over.getBoundingClientRect();

          const anchor: Anchor = { left: left + boundingClientRect.left, top: top + boundingClientRect.top };
          // overlay.textContent = `${x} at ${Math.round(left)},${Math.round(top)}`;
          let container = this.getAdjustedBoundaries(bound);
          PlacementFunction.placement(overlay, anchor, 'right', 'start', container);
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

  private static createRowElement(row: TooltipRowEntry, yScaleUnit?: string) {
    const rowElement = document.createElement('div');
    rowElement.classList.add('tooltip-row');
    if (row.bold) {
      rowElement.setAttribute('style', 'font-weight: bold');
    }
    const leftContainer = document.createElement('div');
    leftContainer.classList.add('left');
    const nameDiv = document.createElement('div');
    nameDiv.classList.add('name');
    const valueDiv = document.createElement('div');
    valueDiv.classList.add('value');
    nameDiv.textContent = `${row.name} `;

    let value = `${Math.trunc(row.value)}`;
    if (yScaleUnit) {
      value += yScaleUnit;
    }
    valueDiv.textContent = value;

    if (row.color) {
      let colorDiv = document.createElement('div');
      colorDiv.classList.add('color');
      colorDiv.style.backgroundColor = row.color;
      leftContainer.appendChild(colorDiv);
    }
    leftContainer.appendChild(nameDiv);
    rowElement.appendChild(leftContainer);
    rowElement.appendChild(valueDiv);
    return rowElement;
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
