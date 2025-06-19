import { ArtefactInlineDetailsComponent } from './components/artefact-inline-details/artefact-inline-details.component';
import { ArtefactInlineAdditionalInfoComponent } from './components/artefact-inline-additional-info/artefact-inline-additional-info.component';
import { ReportNodeErrorComponent } from './components/report-node-error/report-node-error.component';
import { ReportNodeIconComponent } from './components/report-node-icon/report-node-icon.component';
import { ReportDetailsErrorComponent } from './components/report-details-error/report-details-error.component';
import { ReportDetailsAttachmentsComponent } from './components/report-details-attachments/report-details-attachments.component';
import { ArtefactInlineFieldComponent } from './components/artefact-inline-field/artefact-inline-field.component';
import { ArtefactInlineFieldListComponent } from './components/artefact-inline-field-list/artefact-inline-field-list.component';
import { ArtefactInlineFieldListPrefixDirective } from './directives/artefact-inline-field-list-prefix.directive';
import { ArtefactInlineDetailsHeaderDirective } from './directives/artefact-inline-details-header.directive';
import { ArtefactInlineDetailsHeaderComponent } from './components/artefact-inline-details-header/artefact-inline-details-header.component';

export * from './components/base-inline-artefact.component';
export * from './components/base-inline-artefact-legacy.component';
export * from './components/base-report-details.component';
export * from './components/base-artefact.component';
export * from './components/artefact-inline-details/artefact-inline-details.component';
export * from './components/artefact-inline-additional-info/artefact-inline-additional-info.component';
export * from './components/report-node-error/report-node-error.component';
export * from './components/report-node-icon/report-node-icon.component';
export * from './components/report-details-error/report-details-error.component';
export * from './components/report-details-attachments/report-details-attachments.component';
export * from './components/artefact-inline-field/artefact-inline-field.component';
export * from './components/artefact-inline-field-list/artefact-inline-field-list.component';
export * from './types/artefact-types';
export * from './types/artefact-inline-item';
export * from './types/artefact-class.enum';
export * from './injectables/artefact.service';
export * from './injectables/artefacts-factory.service';
export * from './injectables/artefact-refresh-notification.service';
export * from './injectables/artefact-inline-item-utils.service';
export * from './injectables/artefact-inline-items-builder.service';
export * from './directives/artefact-inline-field-list-prefix.directive';
export * from './directives/artefact-inline-details-header.directive';
export * from './components/artefact-inline-details-header/artefact-inline-details-header.component';

export const ARTEFACTS_COMMON_EXPORTS = [
  ArtefactInlineDetailsComponent,
  ArtefactInlineAdditionalInfoComponent,
  ReportNodeErrorComponent,
  ReportNodeIconComponent,
  ReportDetailsErrorComponent,
  ReportDetailsAttachmentsComponent,
  ArtefactInlineFieldComponent,
  ArtefactInlineFieldListComponent,
  ArtefactInlineFieldListPrefixDirective,
  ArtefactInlineDetailsHeaderComponent,
  ArtefactInlineDetailsHeaderDirective,
];
