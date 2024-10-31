import { Component, inject, ViewEncapsulation } from '@angular/core';
import { AuthService, SpecialLinksService, ViewRegistryService } from '@exense/step-core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'step-project-settings-menu',
  templateUrl: './project-settings-menu.component.html',
  styleUrl: './project-settings-menu.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ProjectSettingsMenuComponent {
  private _auth = inject(AuthService);

  readonly _activatedRoute = inject(ActivatedRoute);

  readonly _configurationItems = inject(ViewRegistryService)
    .getChildrenRouteInfo(this._activatedRoute)
    .filter((routeData) => this._auth.checkPermissionGroup(routeData));

  private _specialLinks = inject(SpecialLinksService);
  readonly userSettings = this._specialLinks.userSettings();
  readonly adminSettings = this._specialLinks.adminSettings();
}
