// @ts-nocheck
import { TooltipAnchor } from '../types/tooltip-anchor';

/**
 * This is used for tooltips. It creates the overlay container and display it on top of a chart.
 * This function has to be treated like a 'library'. It should not be changed at all.
 * Adding typescript for the moment is not worth it.
 */
export class TooltipPlacementFunction {
  public static placement(
    overlay: Element,
    anchor: TooltipAnchor,
    side: string = 'bottom',
    alignment: string = 'center',
    boundContainer?: any,
  ) {
    const anchorBoundaries = {
      top: anchor.bottom,
      bottom: anchor.top,
      left: anchor.right,
      right: anchor.left,
      ...anchor,
    };

    const screenBoundaries = {
      top: 0,
      left: 0,
      bottom: window.innerHeight,
      right: window.innerWidth,
    };

    if (boundContainer) {
      if (boundContainer instanceof Element || boundContainer instanceof Range) {
        boundContainer = this.extractBoundaries(boundContainer.getBoundingClientRect());
      }
      Object.assign(screenBoundaries, boundContainer);
    }

    const overlayStyle = getComputedStyle(overlay);
    const primaryAttributes: any = {};
    const secondaryAttributes: any = {};

    for (const attribute in this.attributeMapping) {
      const sideTopOrBottom = side === 'top' || side === 'bottom';
      primaryAttributes[attribute] = this.attributeMapping[attribute][sideTopOrBottom ? 0 : 1];
      secondaryAttributes[attribute] = this.attributeMapping[attribute][sideTopOrBottom ? 1 : 0];
    }

    overlay.style.position = 'absolute';
    overlay.style.maxWidth = '';
    overlay.style.maxHeight = '';

    const marginStart = parseInt(overlayStyle[secondaryAttributes.marginBefore]);
    const marginEnd = parseInt(overlayStyle[secondaryAttributes.marginAfter]);
    const totalMargin = marginStart + marginEnd;

    const availableSpace =
      screenBoundaries[secondaryAttributes.after] - screenBoundaries[secondaryAttributes.before] - totalMargin;
    const overlayMaxSize = parseInt(overlayStyle[secondaryAttributes.maxSize]);

    // uncomment this if max height/width are needed on the tooltip element.
    // if (!overlayMaxSize || availableSpace < overlayMaxSize) {
    // overlay.style[secondaryAttributes.maxSize] = `${availableSpace}px`;
    // }

    const offsetMarginStart = parseInt(overlayStyle[primaryAttributes.marginBefore]);
    const offsetMarginEnd = parseInt(overlayStyle[primaryAttributes.marginAfter]);
    const totalOffsetMargin = offsetMarginStart + offsetMarginEnd;

    const spaceBefore =
      anchorBoundaries[primaryAttributes.before] - screenBoundaries[primaryAttributes.before] - totalOffsetMargin;
    const spaceAfter =
      screenBoundaries[primaryAttributes.after] - anchorBoundaries[primaryAttributes.after] - totalOffsetMargin;

    if (
      (side === primaryAttributes.before && overlay[primaryAttributes.offsetSize] > spaceBefore) ||
      (side === primaryAttributes.after && overlay[primaryAttributes.offsetSize] > spaceAfter)
    ) {
      side = spaceBefore > spaceAfter ? primaryAttributes.before : primaryAttributes.after;
    }

    const availablePrimarySpace = side === primaryAttributes.before ? spaceBefore : spaceAfter;
    const primaryMaxSize = parseInt(overlayStyle[primaryAttributes.maxSize]);

    if (!primaryMaxSize || availablePrimarySpace < primaryMaxSize) {
      overlay.style[primaryAttributes.maxSize] = `${availablePrimarySpace}px`;
    }

    const primaryScrollOffset = window[primaryAttributes.scrollOffset];
    const calculatePrimaryPosition = (value: number) => {
      return Math.max(
        screenBoundaries[primaryAttributes.before],
        Math.min(
          value,
          screenBoundaries[primaryAttributes.after] - overlay[primaryAttributes.offsetSize] - totalOffsetMargin,
        ),
      );
    };

    if (side === primaryAttributes.before) {
      overlay.style[primaryAttributes.before] = `${
        primaryScrollOffset +
        calculatePrimaryPosition(
          anchorBoundaries[primaryAttributes.before] - overlay[primaryAttributes.offsetSize] - totalOffsetMargin,
        )
      }px`;
      overlay.style[primaryAttributes.after] = 'auto';
    } else {
      overlay.style[primaryAttributes.before] = `${
        primaryScrollOffset + calculatePrimaryPosition(anchorBoundaries[primaryAttributes.after])
      }px`;
      overlay.style[primaryAttributes.after] = 'auto';
    }

    const secondaryScrollOffset = window[secondaryAttributes.scrollOffset];
    const calculateSecondaryPosition = (value: number) => {
      return Math.max(
        screenBoundaries[secondaryAttributes.before],
        Math.min(
          value,
          screenBoundaries[secondaryAttributes.after] - overlay[secondaryAttributes.offsetSize] - totalMargin,
        ),
      );
    };

    switch (alignment) {
      case 'start':
        overlay.style[secondaryAttributes.before] = `${
          secondaryScrollOffset + calculateSecondaryPosition(anchorBoundaries[secondaryAttributes.before] - marginStart)
        }px`;
        overlay.style[secondaryAttributes.after] = 'auto';
        break;
      case 'end':
        overlay.style[secondaryAttributes.before] = 'auto';
        overlay.style[secondaryAttributes.after] = `${
          secondaryScrollOffset +
          calculateSecondaryPosition(
            document.documentElement[secondaryAttributes.clientSize] -
              anchorBoundaries[secondaryAttributes.after] -
              marginEnd,
          )
        }px`;
        break;
      default:
        const midpoint = anchorBoundaries[secondaryAttributes.after] - anchor;
        overlay.style[secondaryAttributes.before] = `${
          secondaryScrollOffset +
          calculateSecondaryPosition(
            anchorBoundaries[secondaryAttributes.before] +
              midpoint / 2 -
              overlay[secondaryAttributes.offsetSize] / 2 -
              marginStart,
          )
        }px`;
        overlay.style[secondaryAttributes.after] = 'auto';
    }

    overlay.dataset.side = side;
    overlay.dataset.align = alignment;
  }

  static attributeMapping = {
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

  private static extractBoundaries(rect: ClientRect | DOMRect) {
    return {
      top: rect.top,
      bottom: rect.bottom,
      left: rect.left,
      right: rect.right,
    };
  }
}
