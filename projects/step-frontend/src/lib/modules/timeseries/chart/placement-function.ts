// @ts-nocheck
/**
 * This is used for tooltips. It creates the overlay container and display it on top of a chart.
 * This function has to be treated like a 'library'. It should not be changed at all.
 * Adding typescript for the moment is not worth it.
 */

export class PlacementFunction {
  public static placement(overlay, anchor: any, f, a, i) {
    void 0 === f && (f = 'bottom'),
      void 0 === a && (a = 'center'),
      void 0 === i && (i = {}),
      (anchor instanceof Element || anchor instanceof Range) &&
        (anchor = this.extractBoundaries(anchor.getBoundingClientRect()));
    var n = Object.assign(
        {
          top: anchor.bottom,
          bottom: anchor.top,
          left: anchor.right,
          right: anchor.left,
        },
        anchor
      ),
      s = {
        top: 0,
        left: 0,
        bottom: window.innerHeight,
        right: window.innerWidth,
      };
    i.bound &&
      ((i.bound instanceof Element || i.bound instanceof Range) &&
        (i.bound = this.extractBoundaries(i.bound.getBoundingClientRect())),
      Object.assign(s, i.bound));
    var l = getComputedStyle(overlay),
      m: any = {},
      b: any = {};
    for (var g in this.e)
      (m[g] = this.e[g]['top' === f || 'bottom' === f ? 0 : 1]),
        (b[g] = this.e[g]['top' === f || 'bottom' === f ? 1 : 0]);
    (overlay.style.position = 'absolute'), (overlay.style.maxWidth = ''), (overlay.style.maxHeight = '');
    var d = parseInt(l[b.marginBefore]),
      c = parseInt(l[b.marginAfter]),
      u = d + c,
      p = s[b.after] - s[b.before] - u,
      h = parseInt(l[b.maxSize]);
    (!h || p < h) && (overlay.style[b.maxSize] = p + 'px');
    var x = parseInt(l[m.marginBefore]) + parseInt(l[m.marginAfter]),
      y = n[m.before] - s[m.before] - x,
      z = s[m.after] - n[m.after] - x;
    ((f === m.before && overlay[m.offsetSize] > y) || (f === m.after && overlay[m.offsetSize] > z)) &&
      (f = y > z ? m.before : m.after);
    var S = f === m.before ? y : z,
      v = parseInt(l[m.maxSize]);
    (!v || S < v) && (overlay.style[m.maxSize] = S + 'px');
    var w = window[m.scrollOffset],
      O = function (e: any): any {
        return Math.max(s[m.before], Math.min(e, s[m.after] - overlay[m.offsetSize] - x));
      };
    f === m.before
      ? ((overlay.style[m.before] = w + O(n[m.before] - overlay[m.offsetSize] - x) + 'px'),
        (overlay.style[m.after] = 'auto'))
      : ((overlay.style[m.before] = w + O(n[m.after]) + 'px'), (overlay.style[m.after] = 'auto'));
    var B = window[b.scrollOffset],
      I = function (e: any): any {
        return Math.max(s[b.before], Math.min(e, s[b.after] - overlay[b.offsetSize] - u));
      };
    switch (a) {
      case 'start':
        (overlay.style[b.before] = B + I(n[b.before] - d) + 'px'), (overlay.style[b.after] = 'auto');
        break;
      case 'end':
        (overlay.style[b.before] = 'auto'),
          (overlay.style[b.after] = B + I(document.documentElement[b.clientSize] - n[b.after] - c) + 'px');
        break;
      default:
        var H = n[b.after] - n[b.before];
        (overlay.style[b.before] = B + I(n[b.before] + H / 2 - overlay[b.offsetSize] / 2 - d) + 'px'),
          (overlay.style[b.after] = 'auto');
    }
    (overlay.dataset.side = f), (overlay.dataset.align = a);
  }

  static e = {
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

  private static extractBoundaries(e) {
    return {
      top: e.top,
      bottom: e.bottom,
      left: e.left,
      right: e.right,
    };
  }
}
