import { Component, inject, TrackByFunction } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ViewRegistryService } from '../../services/view-registry.service';
import { SubRouteData } from '../../shared';

@Component({
  selector: 'step-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent {
  readonly _activatedRoute = inject(ActivatedRoute);
  private resolveChildFor = this._activatedRoute.snapshot.data['resolveChildFor'];
  readonly _configurationItems = inject(ViewRegistryService).getChildrenRouteInfo(this.resolveChildFor);
  readonly trackByFn: TrackByFunction<SubRouteData> = (index, item) => item.path;
}
