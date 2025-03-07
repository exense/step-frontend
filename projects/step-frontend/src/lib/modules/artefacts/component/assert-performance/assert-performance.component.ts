import { Component, inject, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { BaseArtefactComponent, dynamicValueFactory, ArtefactFormChangeHelperService } from '@exense/step-core';
import { AssertOperatorType } from '@exense/step-core';
import { AssertPerformanceArtefact } from '../../types/assert-performance.artefact';
import { AssertPerformanceListService } from '../../injectables/assert-performance-list.service';

const { createDynamicValueString } = dynamicValueFactory();

@Component({
  selector: 'step-assert-performance',
  templateUrl: './assert-performance.component.html',
  styleUrls: ['./assert-performance.component.scss'],
  providers: [ArtefactFormChangeHelperService],
})
export class AssertPerformanceComponent extends BaseArtefactComponent<AssertPerformanceArtefact> {
  protected readonly _lists = inject(AssertPerformanceListService);

  @ViewChild('form')
  protected form!: NgForm;

  override contextChange(): void {
    super.contextChange();
    this.setDefaultFilters();
  }

  private setDefaultFilters(): void {
    const artefact = this.context.artefact;
    if (!artefact || artefact._class !== 'PerformanceAssert' || !!artefact.filters) {
      return;
    }
    artefact.filters = [
      {
        field: createDynamicValueString({ value: 'name' }),
        filter: createDynamicValueString({ value: '' }),
        filterType: AssertOperatorType.EQUALS,
      },
    ];
  }
}
