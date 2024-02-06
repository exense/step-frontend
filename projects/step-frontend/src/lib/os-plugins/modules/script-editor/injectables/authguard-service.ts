import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot } from '@angular/router';
import { ScriptEditorComponent } from '@exense/step-frontend';
import { DeactivateComponentDataInterface } from '../types/deactivate-component-data.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthGuardService implements CanDeactivate<ScriptEditorComponent> {
  canDeactivate(
    component: DeactivateComponentDataInterface,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState: RouterStateSnapshot
  ): boolean {
    return component.canExit();
  }
}
