//@ts-ignore
import uPlot = require('uplot');
import { PlacementFunction } from './placement-function';
import { TimeSeriesConfig } from '../time-series.config';

interface TooltipRowEntry {
  value: number;
  name: string;
  color: string;
}

interface Anchor {
  left?: number;
  top?: number;
  bottom?: number;
  right?: number;
}

interface TooltipPluginSettings {
  yScaleUnit?: string; // string to append on the y axis values
  zAxisLabel?: string;
}

export class TooltipPlugin {
  public static getInstance(settings: TooltipPluginSettings): uPlot.Plugin {
    let over: any;
    let bound: any;
    let bLeft: any;
    let bTop: any;

    function syncBounds(): void {
      let bbox = over.getBoundingClientRect();
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
          };

          over.onmouseleave = () => {
            overlay.style.display = 'none';
          };
        },
        destroy: (u: uPlot) => {
          overlay.remove();
        },
        setSize: (u: uPlot) => {
          syncBounds();
        },
        setCursor: (u: uPlot) => {
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
            if (series.scale === 'total' && bucketValue) {
              summaryRow = {
                value: bucketValue,
                color: TimeSeriesConfig.SUMMARY_BARS_COLOR,
                name: settings.zAxisLabel || 'Total',
              };
            }
          }
          yPoints.sort((a, b) => (a.value - b.value) * -1);
          let allSeriesLength = yPoints.length;
          let elementsToSelect = 5;
          let elipsisBefore = true;
          let elipsisAfter = true;
          if (yPoints.length > elementsToSelect) {
            var closestIndex = this.getClosestIndex(hoveredValue, yPoints);
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
            let rowElement = this.createRowElement(point, settings.yScaleUnit);
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

          // overlay.appendChild(dots);
          // the feature will display the closest value for the y scale only, and just one value for the second scale (if present)
          let anchorPadding = 12;
          const anchor: Anchor = { left: left + bLeft + anchorPadding, top: top + bTop };
          // overlay.textContent = `${x} at ${Math.round(left)},${Math.round(top)}`;
          PlacementFunction.placement(overlay, anchor, 'right', 'start', { bound });
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

  private static createRowElement(point: TooltipRowEntry, yScaleUnit?: string) {
    var rowElement = document.createElement('div');
    rowElement.classList.add('tooltip-row');
    let content = document.createElement('div');
    let textContent = `${point.name} : ${Math.trunc(point.value)} `;
    if (yScaleUnit) {
      textContent += yScaleUnit;
    }
    content.textContent = textContent;
    if (point.color) {
      let colorDiv = document.createElement('div');
      colorDiv.classList.add('color');
      colorDiv.style.backgroundColor = point.color;
      rowElement.appendChild(colorDiv);
    }
    rowElement.appendChild(content);
    return rowElement;
  }

  private static getClosestIndex(num: number, arr: TooltipRowEntry[]): number {
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
