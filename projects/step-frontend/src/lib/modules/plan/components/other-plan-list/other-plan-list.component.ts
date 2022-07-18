import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_LOCATION, AJS_MODULE, AugmentedPlansService, Plan } from '@exense/step-core';
import { ILocationService } from 'angular';

@Component({
  selector: 'step-other-plan-list',
  templateUrl: './other-plan-list.component.html',
  styleUrls: ['./other-plan-list.component.scss'],
})
export class OtherPlanListComponent {
  @Output() onSelection = new EventEmitter<string>();

  constructor(
    readonly _plansApiService: AugmentedPlansService,
    private _httpClient: HttpClient,
    @Inject(AJS_LOCATION) private _location: ILocationService
  ) {}

  addPlan(id: string): void {
    this.onSelection.emit(id);
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepOtherPlanList', downgradeComponent({ component: OtherPlanListComponent }));
