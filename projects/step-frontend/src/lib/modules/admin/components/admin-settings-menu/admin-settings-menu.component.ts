import { Component, inject, ViewEncapsulation } from '@angular/core';
import { AuthService, ViewRegistryService } from '@exense/step-core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'step-admin-settings-menu',
  templateUrl: './admin-settings-menu.component.html',
  styleUrl: './admin-settings-menu.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class AdminSettingsMenuComponent {
  private _auth = inject(AuthService);

  readonly _activatedRoute = inject(ActivatedRoute);

  readonly _configurationItems = inject(ViewRegistryService)
    .getChildrenRouteInfo(this._activatedRoute)
    .filter((routeData) => this._auth.checkPermissionGroup(routeData));
}
