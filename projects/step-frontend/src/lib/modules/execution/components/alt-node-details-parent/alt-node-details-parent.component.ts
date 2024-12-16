import { Component, forwardRef, inject } from '@angular/core';
import { DialogParentService, DialogRouteResult } from '@exense/step-core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'step-alt-node-details-parent',
  templateUrl: './alt-node-details-parent.component.html',
  styleUrl: './alt-node-details-parent.component.scss',
  providers: [
    {
      provide: DialogParentService,
      useExisting: forwardRef(() => AltNodeDetailsParentComponent),
    },
  ],
})
export class AltNodeDetailsParentComponent implements DialogParentService {
  private _activatedRoute = inject(ActivatedRoute);
  private _router = inject(Router);

  navigateBack(result?: DialogRouteResult): void {
    this._router.navigate(['..'], { relativeTo: this._activatedRoute, queryParamsHandling: 'merge' });
  }
}
