import { ConnectedPosition } from '@angular/cdk/overlay';

export type ArrowSide = 'top' | 'bottom' | 'left' | 'right';

/** Decide on which edge the arrow sits based on the connection pair. */
export function sideFromPair(pair: ConnectedPosition): ArrowSide {
  if (pair.overlayY === 'top' && pair.originY === 'bottom') return 'top';
  if (pair.overlayY === 'bottom' && pair.originY === 'top') return 'bottom';
  if (pair.overlayX === 'start' && pair.originX === 'end') return 'left';
  return 'right';
}

/** Build primary+fallback positions and leave room for the arrow via offsets. */
export function buildPositions(
  x: 'before' | 'after',
  y: 'above' | 'below',
  arrow = 8,
  gutter = 6,
): ConnectedPosition[] {
  const P = (xx: 'before' | 'after', yy: 'above' | 'below'): ConnectedPosition => {
    const originX = (xx === 'after' ? 'start' : 'end') as 'start' | 'end';
    const overlayX = originX;
    const originY = (yy === 'above' ? 'top' : 'bottom') as 'top' | 'bottom';
    const overlayY = (yy === 'above' ? 'bottom' : 'top') as 'bottom' | 'top';

    const pos: ConnectedPosition = { originX, originY, overlayX, overlayY };

    // Add a gap so the triangle can sit between trigger and panel
    if (overlayY === 'top') pos.offsetY = arrow + gutter; // panel below trigger
    if (overlayY === 'bottom') pos.offsetY = -(arrow + gutter); // panel above trigger
    if (overlayX === 'start' && originX === 'end') pos.offsetX = arrow + gutter; // right of trigger
    if (overlayX === 'end' && originX === 'start') pos.offsetX = -(arrow + gutter); // left of trigger

    return pos;
  };

  const primary = P(x, y);
  const flipY = P(x, y === 'above' ? 'below' : 'above');
  const flipX = P(x === 'after' ? 'before' : 'after', y);
  const flipBoth = P(x === 'after' ? 'before' : 'after', y === 'above' ? 'below' : 'above');

  return [primary, flipY, flipX, flipBoth];
}
