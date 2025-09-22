import { Component, computed, effect, input, model, output } from '@angular/core';
import { StepBasicsModule } from '../../../basics/step-basics.module';
import { AceMode } from '../../types/ace-mode.enum';
import { KeyValue } from '@angular/common';

const ALL_MODES: Record<AceMode, string> = Object.keys(AceMode).reduce(
  (result, readableKey) => {
    const key = (AceMode as Record<string, AceMode>)[readableKey];
    result[key] = readableKey;
    return result;
  },
  {} as Record<AceMode, string>,
);

@Component({
  selector: 'step-rich-editor-settings-bar',
  imports: [StepBasicsModule],
  templateUrl: './rich-editor-settings-bar.component.html',
  styleUrl: './rich-editor-settings-bar.component.scss',
})
export class RichEditorSettingsBarComponent {
  readonly allowedModes = input<AceMode[] | undefined>(undefined);
  readonly predefinedMode = input<AceMode | undefined>(undefined);
  readonly showAutoFormatBtn = input(false);
  readonly modeChanged = output<AceMode>();
  readonly autoFormat = output();

  protected displayModes = computed<KeyValue<AceMode, string>[]>(() => {
    const predefinedMode = this.predefinedMode();
    const allowedModes = this.allowedModes();

    const entries = !!predefinedMode ? [[predefinedMode, ALL_MODES[predefinedMode]]] : Object.entries(ALL_MODES);

    return entries
      .filter(([key]) => !allowedModes || allowedModes.includes(key as AceMode))
      .map(([key, value]) => ({ key, value }) as KeyValue<AceMode, string>);
  });

  protected selectedMode = model(AceMode.TEXT);

  private effectAllowedModesReady = effect(() => {
    const initialMode = this.displayModes()[0]?.key ?? AceMode.TEXT;
    this.selectedMode.set(initialMode);
  });

  private effectModeChanged = effect(() => this.modeChanged.emit(this.selectedMode()));
}
