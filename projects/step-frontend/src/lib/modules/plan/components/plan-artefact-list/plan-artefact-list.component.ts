import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_LOCATION, AJS_MODULE } from '@exense/step-core';
import { ILocationService } from 'angular';
import { ArtefactService } from '../../services/artefact.service';

@Component({
  selector: 'step-plan-artefact-list',
  templateUrl: './plan-artefact-list.component.html',
  styleUrls: ['./plan-artefact-list.component.scss'],
})
export class PlanArtefactListComponent implements OnInit {
  @Output() onSelection = new EventEmitter<string>();

  constructor(readonly _artefactService: ArtefactService, @Inject(AJS_LOCATION) private _location: ILocationService) {}

  ngOnInit(): void {
    this._artefactService.fetchAndProvideAvailableArtefacts(); // update available artifacts from the server
  }

  addControl(id: string): void {
    this.onSelection.emit(id);
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepPlanArtefactList', downgradeComponent({ component: PlanArtefactListComponent }));
