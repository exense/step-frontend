export interface TooltipEvent {
  type: 'SHOW' | 'HIDE' | 'POSITION_CHANGED';
  payload?: any;
}
