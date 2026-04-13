import { WidgetPosition } from './widget-position';

export interface PositionToApply {
  readonly canBeApplied: boolean;
  readonly position: WidgetPosition;
}
