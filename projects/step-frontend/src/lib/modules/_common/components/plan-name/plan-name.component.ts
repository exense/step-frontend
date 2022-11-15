import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { PlansService, RepositoryObjectReference } from '@exense/step-core';
import { map, Observable } from 'rxjs';

@Component({
  selector: 'step-plan-name',
  templateUrl: './plan-name.component.html',
  styleUrls: ['./plan-name.component.scss'],
})
export class PlanNameComponent implements OnChanges {
  @Input() planRef?: RepositoryObjectReference;

  planName$?: Observable<string>;

  constructor(private _plansService: PlansService) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.planRefChanges(changes);
  }

  private planRefChanges(changes: SimpleChanges): void {
    if (!changes['planRef']) {
      return;
    }

    if (changes['planRef'].currentValue !== changes['planRef'].previousValue || changes['planRef'].firstChange) {
      this.initPlanName();
    }
  }

  private initPlanName(): void {
    if (this.planRef && this.planRef.repositoryID === 'local') {
      this.planName$ = this._plansService
        .getPlanById(this.planRef.repositoryParameters!['planid']!)
        .pipe(map((plan) => plan.attributes!['name']));
    }
  }
}
