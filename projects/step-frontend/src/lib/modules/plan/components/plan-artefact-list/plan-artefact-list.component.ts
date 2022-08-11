import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_LOCATION, AJS_MODULE } from '@exense/step-core';
import { ILocationService } from 'angular';
import { ArtefactService } from '../../services/artefact.service';

@Component({
  selector: 'step-plan-artefact-list',
  templateUrl: './plan-artefact-list.component.html',
  styleUrls: ['./plan-artefact-list.component.scss'],
})
export class PlanArtefactListComponent {
  @Output() onSelection = new EventEmitter<string>();

  constructor(
    readonly _artefactService: ArtefactService,
    private _httpClient: HttpClient,
    @Inject(AJS_LOCATION) private _location: ILocationService
  ) {}

  addControl(id: string): void {
    this.onSelection.emit(id);
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepPlanArtefactList', downgradeComponent({ component: PlanArtefactListComponent }));
