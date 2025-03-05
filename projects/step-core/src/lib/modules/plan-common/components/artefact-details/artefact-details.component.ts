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
  ViewEncapsulation,
} from '@angular/core';
import { ArtefactService, ArtefactType } from '../../../artefacts-common/injectables/artefact.service';
import { ArtefactContext } from '../../types/artefact-context';
import { AbstractArtefact, DynamicValueString } from '../../../../client/step-client-module';
import { FormsModule, NgForm } from '@angular/forms';
import { ArtefactFormChangeHelperService } from '../../injectables/artefact-form-change-helper.service';
import { BehaviorSubject } from 'rxjs';
import { StepIconsModule } from '../../../step-icons/step-icons.module';
import { EDITABLE_LABELS_EXPORTS } from '../../../editable-labels';
import { DynamicFormsModule } from '../../../dynamic-forms/dynamic-forms.module';
import { CustomRegistriesModule } from '../../../custom-registeries/custom-registries.module';
import { StepMaterialModule } from '../../../step-material/step-material.module';
import { NgClass } from '@angular/common';

@Component({
  selector: 'step-artefact-details',
  templateUrl: './artefact-details.component.html',
  styleUrl: './artefact-details.component.scss',
  providers: [ArtefactFormChangeHelperService],
  encapsulation: ViewEncapsulation.None,
  imports: [
    StepIconsModule,
    EDITABLE_LABELS_EXPORTS,
    FormsModule,
    DynamicFormsModule,
    CustomRegistriesModule,
    StepMaterialModule,
    NgClass,
  ],
  standalone: true,
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
  protected isPlan = false;
  protected isDirectPlan = false;

  protected artefactMeta?: ArtefactType;

  ngAfterViewInit(): void {
    this._artefactFormChangeHelper.setupFormBehavior(this.form.form, () => this.save());
  }

  ngOnChanges(changes: SimpleChanges): void {
    const cArtefact = changes['artefact'];
    if (cArtefact?.currentValue !== cArtefact?.previousValue || cArtefact?.firstChange) {
      const artefact = cArtefact?.currentValue as AbstractArtefact | undefined;
      this.determineArtefactMetaData(artefact?._class, artefact);
      if (this.form) {
        this._artefactFormChangeHelper.setupFormBehavior(this.form.form, () => this.save());
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

  private determineArtefactMetaData(classname?: string, artefact?: AbstractArtefact): void {
    if (!classname) {
      this.isKeyword = false;
      this.isPlan = false;
      return;
    }
    this.isKeyword = classname === 'CallKeyword';
    this.isPlan = classname === 'CallPlan';
    this.isDirectPlan = this.isPlan && !!(artefact as { planId?: string }).planId;
    this.artefactMeta = this._artefactsService.getArtefactType(classname);
  }
}
