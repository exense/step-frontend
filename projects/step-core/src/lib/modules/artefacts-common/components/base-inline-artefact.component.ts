import { Component, computed, signal } from '@angular/core';
import { CustomComponent } from '../../custom-registeries/custom-registries.module';
import { InlineArtefactContext, ReportNodeWithArtefact } from '../types/artefact-types';
import { AbstractArtefact, ReportNode } from '../../../client/step-client-module';

@Component({
  template: '',
})
export abstract class BaseInlineArtefactComponent<
  A extends AbstractArtefact,
  R extends ReportNode = ReportNodeWithArtefact<A>,
> implements CustomComponent
{
  private contextInternal = signal<InlineArtefactContext<A, R> | undefined>(undefined);
  protected info = computed(() => this.contextInternal()?.aggregatedInfo);
  protected headerTemplate = computed(() => this.contextInternal()?.headerTemplate);

  protected readonly currentContext = this.contextInternal.asReadonly();

  context?: InlineArtefactContext<A, R>;

  contextChange(previousContext?: InlineArtefactContext<A, R>, currentContext?: InlineArtefactContext<A, R>) {
    this.contextInternal.set(currentContext);
  }
}
