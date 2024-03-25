import { Component, inject } from '@angular/core';
import { AppConfigContainerService, AuthService, ViewRegistryService } from '@exense/step-core';
import { UserStateService } from '../../modules/admin/admin.module';

@Component({
  selector: 'step-main-view',
  templateUrl: './main-view.component.html',
  styleUrls: ['./main-view.component.scss'],
  providers: [UserStateService],
})
export class MainViewComponent {
  private _viewRegistry = inject(ViewRegistryService);
  readonly _appConfig = inject(AppConfigContainerService);
  readonly _authService = inject(AuthService);

  readonly navBarRightMenuItems = this._viewRegistry.getDashlets('menu/navbar/right');
  readonly adminAlerts = this._viewRegistry.getDashlets('admin/alerts');
}
