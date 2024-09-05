import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StepMaterialModule } from '../step-material/step-material.module';
import { ArrayFilterComponent } from './components/array-filter/array-filter.component';
import { ArrayFilterAdvancedComponent } from './components/array-filter-advanced/array-filter-advanced.component';
import { HexadecimalInputFilterComponent } from './components/input-filter/hexadecimal-input-filter.component';
import { InputFilterComponent } from './components/input-filter/input-filter.component';
import { ResourceLabelComponent } from './components/resource-label/resource-label.component';
import { ArtefactIconPipe } from './pipes/artefact-icon.pipe';
import { ZIndexDirective } from './directives/z-index.directive';
import { JsonRawEditorComponent } from './components/json-raw-editor/json-raw-editor.component';
import { ElementRefMapDirective } from './directives/element-ref-map.directive';
import { WidthExpandersDirective } from './directives/width-expanders.directive';
import { ModalWindowComponent } from './components/modal-window/modal-window.component';
import { FormFieldComponent } from './components/form-field/form-field.component';
import { LabelDirective } from './directives/label.directive';
import { PrefixDirective } from './directives/prefix.directive';
import { SuffixDirective } from './directives/suffix.directive';
import { HintDirective } from './directives/hint.directive';
import { ErrorDirective } from './directives/error.directive';
import { AlertDirective } from './directives/alert.directive';
import { ValidateJsonDirective } from './directives/validate-json.directive';
import { ErrorsListComponent } from './components/errors-list/errors-list.component';
import { PreventCharsDirective } from './directives/prevent-chars.directive';
import { SingleItemArrayFilterComponent } from './components/single-item-array-filter/single-item-array-filter.component';
import { ProgressBarComponent } from './components/progress-bar/progress-bar.component';
import { UploadContainerComponent } from './components/upload-container/upload-container.component';
import { JsonRawEditorFormattedComponent } from './components/json-raw-editor-formatted/json-raw-editor-formatted.component';
import { LabelAddonDirective } from './directives/label-addon.directive';
import { TimeInputComponent } from './components/time-input/time-input.component';
import { ProjectSwitchDialogComponent } from './components/project-switch-dialog/project-switch-dialog.component';
import { ArrayInputComponent } from './components/array-input/array-input.component';
import { RouterModule } from '@angular/router';
import { StringArrayInputComponent } from './components/string-array-input/string-array-input.component';
import { ArrayItemLabelPipe } from './pipes/array-item-label.pipe';
import { AllowCharsDirective } from './directives/allow-chars.directive';
import { ItemHoverDirective } from './directives/item-hover.directive';
import { ItemHoldDirective } from './directives/item-hold.directive';
import { PerTimeUnitInputComponent } from './components/time-input/per-time-unit-input.component';
import { AutocompleteInputComponent } from './components/autocomplete-input/autocomplete-input.component';
import { PopoverContentDirective } from './directives/popover-content.directive';
import { TriggerPopoverDirective } from './directives/trigger-popover.directive';
import { PopoverComponent } from './components/popover/popover.component';
import { SafeHtmlPipe } from './pipes/safe-html.pipe';
import { DescriptionHintComponent } from './components/description-hint/description-hint.component';
import { DurationPipe } from './pipes/duration.pipe';
import { DialogRouteComponent } from './components/dialog-route/dialog-route.component';
import { MarkerComponent } from './components/marker/marker.component';
import { AlertsContainerComponent } from './components/alerts-container/alerts-container.component';
import { InputModelFormatterDirective } from './directives/input-model-formatter.directive';
import { EnterTextValueDialogComponent } from './components/enter-text-value-dialog/enter-text-value-dialog.component';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { MessagesListDialogComponent } from './components/messages-list-dialog/messages-list-dialog.component';
import { MessageDialogComponent } from './components/message-dialog/message-dialog.component';
import { ProjectNamePipe } from './pipes/project-name.pipe';
import { GetObjectFieldPipe } from './pipes/get-object-field.pipe';
import { StatusCommonComponent } from './components/status-common/status-common.component';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { SimpleObjectInputComponent } from './components/simple-object-input/simple-object-input.component';
import { WarningDirective } from './directives/warning.directive';
import { ControlHasWarningsPipe } from './pipes/control-has-warnings.pipe';
import { ControlWarningsPipe } from './pipes/control-warnings.pipe';
import { BigNumberPipe } from './pipes/big-number.pipe';
import { BooleanFilterComponent } from './components/boolean-filter/boolean-filter.component';

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, StepMaterialModule, RouterModule, NgxMatSelectSearchModule],
  declarations: [
    ResourceLabelComponent,
    ArrayFilterComponent,
    ArrayFilterAdvancedComponent,
    InputFilterComponent,
    HexadecimalInputFilterComponent,
    ArtefactIconPipe,
    ZIndexDirective,
    JsonRawEditorComponent,
    ElementRefMapDirective,
    WidthExpandersDirective,
    ModalWindowComponent,
    FormFieldComponent,
    LabelDirective,
    PrefixDirective,
    SuffixDirective,
    HintDirective,
    ErrorDirective,
    WarningDirective,
    AlertDirective,
    ValidateJsonDirective,
    ErrorsListComponent,
    PreventCharsDirective,
    JsonRawEditorFormattedComponent,
    LabelAddonDirective,
    SingleItemArrayFilterComponent,
    ProgressBarComponent,
    UploadContainerComponent,
    ProjectSwitchDialogComponent,
    TimeInputComponent,
    PerTimeUnitInputComponent,
    ArrayInputComponent,
    StringArrayInputComponent,
    ArrayItemLabelPipe,
    AllowCharsDirective,
    ItemHoverDirective,
    ItemHoldDirective,
    AutocompleteInputComponent,
    PopoverContentDirective,
    TriggerPopoverDirective,
    PopoverComponent,
    SafeHtmlPipe,
    DescriptionHintComponent,
    EnterTextValueDialogComponent,
    ConfirmationDialogComponent,
    MessagesListDialogComponent,
    MessageDialogComponent,
    DurationPipe,
    DialogRouteComponent,
    MarkerComponent,
    AlertsContainerComponent,
    InputModelFormatterDirective,
    ProjectNamePipe,
    GetObjectFieldPipe,
    StatusCommonComponent,
    SimpleObjectInputComponent,
    ControlHasWarningsPipe,
    ControlWarningsPipe,
    BigNumberPipe,
    BooleanFilterComponent,
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    StepMaterialModule,
    RouterModule,
    ResourceLabelComponent,
    ArrayFilterComponent,
    InputFilterComponent,
    HexadecimalInputFilterComponent,
    ArtefactIconPipe,
    ZIndexDirective,
    JsonRawEditorComponent,
    ElementRefMapDirective,
    WidthExpandersDirective,
    ModalWindowComponent,
    FormFieldComponent,
    LabelDirective,
    PrefixDirective,
    SuffixDirective,
    HintDirective,
    ErrorDirective,
    WarningDirective,
    AlertDirective,
    ValidateJsonDirective,
    ErrorsListComponent,
    PreventCharsDirective,
    SingleItemArrayFilterComponent,
    ProgressBarComponent,
    UploadContainerComponent,
    JsonRawEditorFormattedComponent,
    LabelAddonDirective,
    ProjectSwitchDialogComponent,
    TimeInputComponent,
    PerTimeUnitInputComponent,
    ArrayInputComponent,
    StringArrayInputComponent,
    ArrayItemLabelPipe,
    AllowCharsDirective,
    ItemHoverDirective,
    ItemHoldDirective,
    AutocompleteInputComponent,
    PopoverContentDirective,
    TriggerPopoverDirective,
    PopoverComponent,
    SafeHtmlPipe,
    DescriptionHintComponent,
    EnterTextValueDialogComponent,
    ConfirmationDialogComponent,
    MessagesListDialogComponent,
    MessageDialogComponent,
    DurationPipe,
    DialogRouteComponent,
    ArrayFilterAdvancedComponent,
    MarkerComponent,
    AlertsContainerComponent,
    InputModelFormatterDirective,
    ProjectNamePipe,
    GetObjectFieldPipe,
    StatusCommonComponent,
    SimpleObjectInputComponent,
    ControlHasWarningsPipe,
    ControlWarningsPipe,
    BigNumberPipe,
    BooleanFilterComponent,
  ],
})
export class StepBasicsModule {}

export * from './components/base-filter/base-filter.component';
export * from './components/array-filter/array-filter.component';
export * from './components/boolean-filter/boolean-filter.component';
export * from './components/array-filter-advanced/array-filter-advanced.component';
export * from './components/single-item-array-filter/single-item-array-filter.component';
export * from './components/input-filter/hexadecimal-input-filter.component';
export * from './components/input-filter/input-filter.component';
export * from './components/resource-label/resource-label.component';
export * from './components/json-raw-editor/json-raw-editor.component';
export * from './components/json-raw-editor-formatted/json-raw-editor-formatted.component';
export * from './components/project-switch-dialog/project-switch-dialog.component';
export * from './components/modal-window/modal-window.component';
export * from './components/form-field/form-field.component';
export * from './components/errors-list/errors-list.component';
export * from './components/progress-bar/progress-bar.component';
export * from './components/upload-container/upload-container.component';
export * from './components/status-common/status-common.component';
export * from './components/array-input/array-input.component';
export * from './components/autocomplete-input/autocomplete-input.component';
export * from './components/alerts-container/alerts-container.component';
export { TimeUnitDictionary } from './components/time-input/base-time-converter.component';
export * from './components/time-input/time-input.component';
export * from './components/time-input/per-time-unit-input.component';
export * from './components/marker/marker.component';
export * from './components/string-array-input/string-array-input.component';
export * from './directives/z-index.directive';
export * from './pipes/artefact-icon.pipe';
export * from './pipes/big-number.pipe';
export * from './pipes/array-item-label.pipe';
export * from './injectables/item-by-id-cache.service';
export * from './injectables/cron-presets.token';
export * from './types/compare-condition.enum';
export * from './types/alert-type.enum';
export * from './types/screen-width.token';
export * from './types/is-small-screen.token';
export * from './types/resize-observable';
export * from './types/time-unit.enum';
export * from './types/generate-api-key-strategy';
export * from './types/create-range';
export * from './directives/element-ref-map.directive';
export * from './directives/width-expanders.directive';
export * from './directives/validate-json.directive';
export * from './directives/label.directive';
export * from './directives/prefix.directive';
export * from './directives/suffix.directive';
export * from './directives/hint.directive';
export * from './directives/error.directive';
export * from './directives/warning.directive';
export * from './directives/alert.directive';
export * from './directives/prevent-chars.directive';
export * from './directives/allow-chars.directive';
export * from './directives/label-addon.directive';
export * from './types/repository-parameters.token';
export * from './repository-parameters-initializer';
export * from './injectables/array-item-label-value-extractor';
export * from './types/storage-proxy';
export * from './types/storage.token';
export * from './types/multiple-projects-strategy';
export * from './types/validators/json-validator';
export * from './types/validators/number-validator';
export * from './types/validators/boolean-validator';
export * from './types/validators/coma-split-array-validator';
export * from './types/validators/is-regex-validator';
export * from './types/is-used-by-dialog-data';
export * from './types/is-used-by-search-type';
export * from './injectables/multiple-projects.service';
export * from './injectables/generate-api-key.service';
export * from './injectables/editor-resolver.service';
export * from './injectables/app-config-container.service';
export * from './injectables/file-downloader.service';
export * from './injectables/popover-overlay.service';
export * from './injectables/additional-initialization.service';
export * from './injectables/common-entities-urls.service';
export * from './types/link-display-type.enum';
export * from './injectables/is-used-by-dialog';
export * from './directives/item-hover.directive';
export * from './directives/item-hold.directive';
export * from './injectables/item-hover-receiver.service';
export * from './injectables/item-hold-receiver.service';
export * from './injectables/object-utils.service';
export * from './injectables/dialogs.service';
export * from './types/bulk-operation-type.enum';
export * from './types/string-array-regex';
export * from './types/string-hash';
export * from './injectables/dialog-parent.service';
export * from './injectables/alerts.service';
export * from './injectables/quick-access-route.service';
export * from './types/marker-type.enum';
export * from './types/dialog-route';
export * from './types/dialog-route-result';
export * from './types/step-route-additional-config';
export * from './directives/popover-content.directive';
export * from './directives/trigger-popover.directive';
export * from './directives/input-model-formatter.directive';
export * from './components/popover/popover.component';
export * from './pipes/safe-html.pipe';
export * from './pipes/duration.pipe';
export * from './pipes/get-object-field.pipe';
export * from './pipes/project-name.pipe';
export * from './components/description-hint/description-hint.component';
export * from './components/enter-text-value-dialog/enter-text-value-dialog.component';
export * from './components/confirmation-dialog/confirmation-dialog.component';
export * from './components/messages-list-dialog/messages-list-dialog.component';
export * from './components/message-dialog/message-dialog.component';
export * from './components/dialog-route/dialog-route.component';
export * from './types/mutable';
export * from './types/date-format.enum';
export * from './guards/preload-screen-data.resolver';
export * from './injectables/screen-data-meta.service';
export * from './types/time-converter';
export * from './types/form-control-warnings-extension';
export * from './pipes/control-has-warnings.pipe';
export * from './pipes/control-warnings.pipe';
export * from './injectables/time-converters-factory.service';
export * from './components/simple-object-input/simple-object-input.component';
export * from './injectables/statuses-colors.token';
