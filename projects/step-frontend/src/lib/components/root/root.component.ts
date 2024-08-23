import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { AuthService, STATUS_COLORS, ViewRegistryService } from '@exense/step-core';

@Component({
  selector: 'step-root',
  templateUrl: './root.component.html',
  styleUrls: ['./root.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class RootComponent implements OnInit {
  private _statusColors = inject(STATUS_COLORS);
  private _viewRegistry = inject(ViewRegistryService);
  readonly _authService = inject(AuthService);

  ngOnInit(): void {
    this._viewRegistry.initialNavigation();
  }
}
