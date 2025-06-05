import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { AuthService, GLOBAL_INDICATOR, STATUS_COLORS, ViewRegistryService } from '@exense/step-core';

@Component({
  selector: 'step-root',
  templateUrl: './root.component.html',
  styleUrls: ['./root.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class RootComponent implements OnInit {
  private _globalIndicator = inject(GLOBAL_INDICATOR);
  private _statusColors = inject(STATUS_COLORS);
  private _viewRegistry = inject(ViewRegistryService);
  readonly _authService = inject(AuthService);

  ngOnInit(): void {
    this._globalIndicator.removeIndicator();
    this._viewRegistry.initialNavigation();
  }
}
