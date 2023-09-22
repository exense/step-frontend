export abstract class WizardStepActionsService {
  abstract readonly isFirst: boolean;
  abstract readonly isLast: boolean;
  abstract goNext(): void;
  abstract goPrevious(): void;
  abstract goFinish(): void;
  abstract cancel(): void;
}
