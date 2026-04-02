import { CanDeactivateFn } from '@angular/router';
import { Observable } from 'rxjs';
import { CanLeaveComponent } from '../types/can-leave-component.interface';

export const canLeaveComponent: CanDeactivateFn<CanLeaveComponent> = (
  component: CanLeaveComponent,
): boolean | Observable<boolean> => {
  return component.canLeave();
};
