import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AJS_LOCATION, AugmentedPlansService } from '@exense/step-core';
import { ILocationService } from 'angular';

@Component({
  selector: 'step-plan-otherplan-list',
  templateUrl: './plan-otherplan-list.component.html',
  styleUrls: ['./plan-otherplan-list.component.scss'],
})
export class PlanOtherplanListComponent {
  @Output() onSelection = new EventEmitter<string>();

  readonly dataSource = this._plansApiService.getPlansTableDataSource();

  constructor(
    private _plansApiService: AugmentedPlansService,
    private _httpClient: HttpClient,
    @Inject(AJS_LOCATION) private _location: ILocationService
  ) {}

  addPlan(id: string): void {
    this.onSelection.emit(id);
  }
}
