import {
  AfterViewInit,
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ArtefactService, ArtefactType } from '../../services/artefact.service';
import { ArtefactContext } from '../../shared';
import { AbstractArtefact, DynamicValueString } from '../../client/step-client-module';
import { NgForm } from '@angular/forms';
import { ArtefactFormChangeHelperService } from '../../services/artefact-form-change-helper.service';
import { BehaviorSubject, Subject } from 'rxjs';

@Component({
  selector: 'step-artefact-details',
  templateUrl: './artefact-details.component.html',
  styleUrls: ['./artefact-details.component.scss'],
  providers: [ArtefactFormChangeHelperService],
})
export class ArtefactDetailsComponent implements OnChanges, ArtefactContext, AfterViewInit, OnDestroy {
  private _artefactsService = inject(ArtefactService);
  private _artefactFormChangeHelper = inject(ArtefactFormChangeHelperService);

  @ViewChild('form')
  private form!: NgForm;

  private artefactChangeInternal$ = new BehaviorSubject<void>(undefined);

  readonly artefactChange$ = this.artefactChangeInternal$.asObservable();

  protected editorContext: ArtefactContext = this;

  @Input() artefact?: AbstractArtefact;
  @Input() readonly: boolean = false;
  @Output() onSave = new EventEmitter<AbstractArtefact>();

  protected showAttributes = true;

  protected isKeyword = false;

  protected artefactMeta?: ArtefactType;

  ngAfterViewInit(): void {
    this._artefactFormChangeHelper.setupFormBehavior(this.form, () => this.save());
  }

  ngOnChanges(changes: SimpleChanges): void {
    const cArtefact = changes['artefact'];
    if (cArtefact?.currentValue !== cArtefact?.previousValue || cArtefact?.firstChange) {
      const artefact = cArtefact?.currentValue as AbstractArtefact | undefined;
      this.determineArtefactMetaData(artefact?._class);
      if (this.form) {
        this._artefactFormChangeHelper.setupFormBehavior(this.form, () => this.save());
      }
      this.artefactChangeInternal$.next();
    }
  }

  ngOnDestroy(): void {
    this.artefactChangeInternal$.complete();
  }

  save(): void {
    if (this.readonly) {
      return;
    }
    this.artefact!.useDynamicName = this.artefact!.dynamicName!.dynamic;
    this.onSave.emit(this.artefact);
  }

  protected switchToDynamicName(): void {
    this.artefact!.dynamicName!.expression = this.artefact!.attributes!['name'];
    this.artefact!.dynamicName!.dynamic = true;
    this.save();
  }

  protected syncName(dynamicValue: DynamicValueString): void {
    if (dynamicValue.dynamic) {
      return;
    }
    this.artefact!.attributes!['name'] = dynamicValue.value ?? '';
  }

  private determineArtefactMetaData(classname?: string): void {
    if (!classname) {
      this.isKeyword = false;
      return;
    }
    this.isKeyword = classname === 'CallKeyword';
    this.artefactMeta = this._artefactsService.getArtefactType(classname);
  }
}
