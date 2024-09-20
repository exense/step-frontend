import { Component, inject, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ViewRegistryService } from '../../modules/routing';
import { AuthService } from '../../modules/auth';

@Component({
  selector: 'step-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SettingsComponent {
  private _auth = inject(AuthService);
  readonly _activatedRoute = inject(ActivatedRoute);
  private resolveChildFor = this._activatedRoute.snapshot.data['resolveChildFor'];
  readonly _configurationItems = inject(ViewRegistryService)
    .getChildrenRouteInfo(this.resolveChildFor)
    .filter(
      (routeData) => !routeData.accessPermissions?.length || this._auth.hasAnyRights(routeData.accessPermissions),
    );
}
