import { Component, Inject, Input, Optional } from '@angular/core';
import { AJS_LOCATION, CustomColumnOptions, CustomComponent, Plan } from '@exense/step-core';
import { ILocationService } from 'angular';
import { map, of } from 'rxjs';

@Component({
  selector: 'step-plan-link',
  templateUrl: './plan-link.component.html',
  styleUrls: ['./plan-link.component.scss'],
})
export class PlanLinkComponent implements CustomComponent {
  @Input() context?: Plan;
  @Input() iconOnly?: boolean;

  readonly noLink$ = (this._customColumnOptions?.options$ || of([])).pipe(
    map((options) => options.includes('noEditorLink'))
  );

  constructor(
    @Inject(AJS_LOCATION) private _location: ILocationService,
    @Optional() private _customColumnOptions?: CustomColumnOptions
  ) {}

  editPlan(): void {
    if (!this.context) {
      return;
    }
    this._location.path(`/root/plans/editor/${this.context.id}`);
  }
}
