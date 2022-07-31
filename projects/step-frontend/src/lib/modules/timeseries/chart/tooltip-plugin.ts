// @ts-nocheck
import uPlot from '../uplot/uPlot';
var e = {
  size: ['height', 'width'],
  clientSize: ['clientHeight', 'clientWidth'],
  offsetSize: ['offsetHeight', 'offsetWidth'],
  maxSize: ['maxHeight', 'maxWidth'],
  before: ['top', 'left'],
  marginBefore: ['marginTop', 'marginLeft'],
  after: ['bottom', 'right'],
  marginAfter: ['marginBottom', 'marginRight'],
  scrollOffset: ['pageYOffset', 'pageXOffset'],
};
function t(e) {
  return {
    top: e.top,
    bottom: e.bottom,
    left: e.left,
    right: e.right,
  };
}
let placement = function (o, r, f, a, i) {
  void 0 === f && (f = 'bottom'),
    void 0 === a && (a = 'center'),
    void 0 === i && (i = {}),
    (r instanceof Element || r instanceof Range) && (r = t(r.getBoundingClientRect()));
  var n = Object.assign(
      {
        top: r.bottom,
        bottom: r.top,
        left: r.right,
        right: r.left,
      },
      r
    ),
    s = {
      top: 0,
      left: 0,
      bottom: window.innerHeight,
      right: window.innerWidth,
    };
  i.bound &&
    ((i.bound instanceof Element || i.bound instanceof Range) && (i.bound = t(i.bound.getBoundingClientRect())),
    Object.assign(s, i.bound));
  var l = getComputedStyle(o),
    m = {},
    b = {};
  for (var g in e)
    (m[g] = e[g]['top' === f || 'bottom' === f ? 0 : 1]), (b[g] = e[g]['top' === f || 'bottom' === f ? 1 : 0]);
  (o.style.position = 'absolute'), (o.style.maxWidth = ''), (o.style.maxHeight = '');
  var d = parseInt(l[b.marginBefore]),
    c = parseInt(l[b.marginAfter]),
    u = d + c,
    p = s[b.after] - s[b.before] - u,
    h = parseInt(l[b.maxSize]);
  (!h || p < h) && (o.style[b.maxSize] = p + 'px');
  var x = parseInt(l[m.marginBefore]) + parseInt(l[m.marginAfter]),
    y = n[m.before] - s[m.before] - x,
    z = s[m.after] - n[m.after] - x;
  ((f === m.before && o[m.offsetSize] > y) || (f === m.after && o[m.offsetSize] > z)) &&
    (f = y > z ? m.before : m.after);
  var S = f === m.before ? y : z,
    v = parseInt(l[m.maxSize]);
  (!v || S < v) && (o.style[m.maxSize] = S + 'px');
  var w = window[m.scrollOffset],
    O = function (e) {
      return Math.max(s[m.before], Math.min(e, s[m.after] - o[m.offsetSize] - x));
    };
  f === m.before
    ? ((o.style[m.before] = w + O(n[m.before] - o[m.offsetSize] - x) + 'px'), (o.style[m.after] = 'auto'))
    : ((o.style[m.before] = w + O(n[m.after]) + 'px'), (o.style[m.after] = 'auto'));
  var B = window[b.scrollOffset],
    I = function (e) {
      return Math.max(s[b.before], Math.min(e, s[b.after] - o[b.offsetSize] - u));
    };
  switch (a) {
    case 'start':
      (o.style[b.before] = B + I(n[b.before] - d) + 'px'), (o.style[b.after] = 'auto');
      break;
    case 'end':
      (o.style[b.before] = 'auto'),
        (o.style[b.after] = B + I(document.documentElement[b.clientSize] - n[b.after] - c) + 'px');
      break;
    default:
      var H = n[b.after] - n[b.before];
      (o.style[b.before] = B + I(n[b.before] + H / 2 - o[b.offsetSize] / 2 - d) + 'px'), (o.style[b.after] = 'auto');
  }
  (o.dataset.side = f), (o.dataset.align = a);
};

export function tooltipPlugin() {
  let over: any;
  let bound: any;
  let bLeft: any;
  let bTop: any;

  function syncBounds() {
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
        let hoveredValue = u.posToVal(top, 'y');
        if (top < 0) {
          // some weird uplot behaviour. it happens to be -10 many times
          return;
        }
        let yPoints = [];
        for (let i = 1; i < u.series.length; i++) {
          let series = u.series[i];
          if (series.scale === 'y' && series.show) {
            let value = u.data[i][idx];
            if (value != undefined) {
              yPoints.push({ value: value, name: series.label, color: series._stroke });
            }
            continue;
          }
          if (series.scale === 'total') {
            // TODO add this info somewhere
          }
        }
        yPoints.sort((a, b) => (a.value - b.value) * -1);
        let allSeriesLength = yPoints.length;
        let elementsToSelect = 5;
        let elipsisBefore = true;
        let elipsisAfter = true;
        if (yPoints.length > elementsToSelect) {
          var closestIndex = getClosestIndex(hoveredValue, yPoints);
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
          return; // there is no data to show
        }
        overlay.innerHTML = '';
        yPoints.forEach((point) => {
          var rowElement = document.createElement('div');
          rowElement.classList.add('tooltip-row');
          let content = document.createElement('div');
          content.textContent = `${point.name} : ${Math.trunc(point.value)}`;
          let colorDiv = document.createElement('div');
          colorDiv.classList.add('color');
          colorDiv.style.backgroundColor = point.color;
          rowElement.appendChild(colorDiv);
          rowElement.appendChild(content);
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

        // overlay.appendChild(dots);
        // the feature will display the closest value for the y scale only, and just one value for the second scale (if present)
        let anchorPadding = 12;
        const anchor = { left: left + bLeft + anchorPadding, top: top + bTop };
        // overlay.textContent = `${x} at ${Math.round(left)},${Math.round(top)}`;
        placement(overlay, anchor, 'right', 'start', { bound });
      },
    },
  };
}

const getClosestIndex = (num, arr) => {
  let curr = arr[0],
    diff = Math.abs(num - curr.value);
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
};

// export function legendAsTooltipPlugin({style = {backgroundColor: "rgba(255, 249, 196, 0.92)", color: "black"}} = {}) {
//   let legendEl: any;
//
//   function init(u: any) {
//     legendEl = u.root.querySelector(".u-legend");
//     if (legendEl) {
//       legendEl.classList.remove("u-inline");
//
//       uPlot.assign(legendEl.style, {
//         textAlign: "left",
//         pointerEvents: "none",
//         display: "none",
//         position: "absolute",
//         left: 0,
//         top: 0,
//         zIndex: 100,
//         boxShadow: "2px 2px 10px rgba(0,0,0,0.5)",
//         ...style
//       });
//       // hide series color markers
//       const idents = legendEl.querySelectorAll(".u-marker");
//
//       for (let i = 0; i < idents.length; i++)
//         idents[i].style.display = "none";
//
//     }
//
//
//     const overEl = u.over;
//     if (overEl) {
//       overEl.style.overflow = "visible";
//
//       // move legend into plot bounds
//       overEl.appendChild(legendEl);
//
//       // show/hide tooltip on enter/exit
//       overEl.addEventListener("mouseenter", () => {
//         legendEl.style.display = null;
//       });
//       overEl.addEventListener("mouseleave", () => {
//         legendEl.style.display = "none";
//       });
//     }
//
//     // let tooltip exit plot
//     //	overEl.style.overflow = "visible";
//   }
//
//   function update(u: uPlot) {
//     const {left, top} = u.cursor;
//     legendEl.style.transform = "translate(" + left + "px, " + top + "px)";
//   }
//
//   return {
//     hooks: {
//       init: init,
//       setCursor: update,
//     }
//   };
// }
