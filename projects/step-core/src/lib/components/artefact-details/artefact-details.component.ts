import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ArtefactService, ArtefactType } from '../../services/artefact.service';
import { ArtefactContext } from '../../shared';
import { AbstractArtefact } from '../../client/step-client-module';

@Component({
  selector: 'step-artefact-details',
  templateUrl: './artefact-details.component.html',
  styleUrls: ['./artefact-details.component.scss'],
})
export class ArtefactDetailsComponent implements OnChanges, ArtefactContext {
  private _artefactsService = inject(ArtefactService);

  protected editorContext: ArtefactContext = this;

  @Input() artefact?: AbstractArtefact;
  @Input() readonly: boolean = false;
  @Output() onSave = new EventEmitter<AbstractArtefact>();

  protected showAttributes = true;

  protected isKeyword = false;

  protected artefactMeta?: ArtefactType;

  ngOnChanges(changes: SimpleChanges): void {
    const cArtefact = changes['artefact'];
    if (cArtefact?.currentValue !== cArtefact?.previousValue || cArtefact?.firstChange) {
      const artefact = cArtefact?.currentValue as AbstractArtefact | undefined;
      this.determineArtefactMetaData(artefact?._class);
    }
  }

  private determineArtefactMetaData(classname?: string): void {
    if (!classname) {
      this.isKeyword = false;
      return;
    }
    this.isKeyword = classname === 'CallKeyword';
    this.artefactMeta = this._artefactsService.getArtefactType(classname);
  }

  save(): void {
    if (this.readonly) {
      return;
    }
    this.onSave.emit(this.artefact);
  }

  protected switchToDynamicName(): void {
    this.artefact!.dynamicName!.dynamic = true;
    this.save();
  }
}
