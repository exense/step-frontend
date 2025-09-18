import { ConnectedPosition } from '@angular/cdk/overlay';

export type ArrowSide = 'top' | 'bottom' | 'left' | 'right';

export function sideFromPair(pair: ConnectedPosition): ArrowSide {
  if (pair.overlayY === 'top' && pair.originY === 'bottom') return 'top';
  if (pair.overlayY === 'bottom' && pair.originY === 'top') return 'bottom';
  if (pair.overlayX === 'start' && pair.originX === 'end') return 'left';
  return 'right';
}

export function buildPositions(x: 'before' | 'after', y: 'above' | 'below'): ConnectedPosition[] {
  const P = (xx: 'before' | 'after', yy: 'above' | 'below'): ConnectedPosition => {
    const originX = (xx === 'after' ? 'start' : 'end') as 'start' | 'end';
    const overlayX = originX;
    const originY = (yy === 'above' ? 'top' : 'bottom') as 'top' | 'bottom';
    const overlayY = (yy === 'above' ? 'bottom' : 'top') as 'bottom' | 'top';

    return { originX, originY, overlayX, overlayY };
  };

  const primary = P(x, y);
  const flipY = P(x, y === 'above' ? 'below' : 'above');
  const flipX = P(x === 'after' ? 'before' : 'after', y);
  const flipBoth = P(x === 'after' ? 'before' : 'after', y === 'above' ? 'below' : 'above');

  return [primary, flipY, flipX, flipBoth];
}
