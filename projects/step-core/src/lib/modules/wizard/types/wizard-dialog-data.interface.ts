export interface WizardDialogData<T> {
  title: string;
  steps: string[];
  initialModel: T;
  additionalDescription?: string;
}
