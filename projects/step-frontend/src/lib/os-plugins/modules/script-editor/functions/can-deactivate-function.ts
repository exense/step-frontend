import { CanDeactivateFn } from '@angular/router';
import { DeactivateComponentDataInterface } from '../types/deactivate-component-data.interface';
import { Observable } from 'rxjs';

export const canDeactivateFn: CanDeactivateFn<DeactivateComponentDataInterface> = (
  component: DeactivateComponentDataInterface,
): boolean | Observable<boolean> => {
  return component.canExit();
};
