import { WidgetPosition } from './widget-position';

export abstract class WidgetPositionsUtilsContext {
  abstract getField(): Uint8Array;
  abstract getFieldBottom(): number;
  abstract getWidgetPositions(): Record<string, WidgetPosition>;
}
