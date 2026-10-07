import { ChangeDetectionStrategy, Component, computed, inject, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  CustomComponent,
  IDE_MODE,
  IdeStateStrategyService,
  StepCoreModule,
  ViewRegistryService,
} from '@exense/step-core';
import { IdeRemoteDefaultsService, IdeRemoteTarget } from '../../services/ide-remote-defaults.service';
import {
  IdeRemoteOperationDialogComponent,
  IdeRemoteOperationType,
} from '../ide-remote-operation-dialog/ide-remote-operation-dialog.component';

@Component({
  selector: 'step-ide-remote-header',
  imports: [StepCoreModule],
  templateUrl: './ide-remote-header.component.html',
  styleUrl: './ide-remote-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class IdeRemoteHeaderComponent implements CustomComponent {
  private readonly _ideMode = inject(IDE_MODE);
  protected readonly _ideState = inject(IdeStateStrategyService);
  private readonly _dialog = inject(MatDialog);
  protected readonly _defaults = inject(IdeRemoteDefaultsService);
  protected readonly configurationDashlets = inject(ViewRegistryService).getDashlets('ide/remote/configuration');

  context?: unknown;

  protected readonly target = computed<IdeRemoteTarget | undefined>(() => {
    const deployTarget = this._defaults.deployTarget();
    const executeTarget = this._defaults.executeTarget();
    return deployTarget?.url?.trim() ? deployTarget : executeTarget?.url?.trim() ? executeTarget : undefined;
  });
  protected readonly packageError = computed(() => {
    const currentPackage = this._ideState.currentPackage();
    const inProgress = this._ideState.inProgress();
    if (!this._ideMode) {
      return 'Remote operations are available only in Step Studio.';
    }
    if (inProgress) {
      return 'Wait for the automation package operation to finish.';
    }
    return currentPackage ? undefined : 'Open an automation package to use remote operations.';
  });
  protected readonly canDeploy = computed(() => !this.packageError() && this._defaults.canDeploy());
  protected readonly canExecute = computed(() => !this.packageError() && this._defaults.canExecute());
  protected readonly menuHint = computed(() => {
    const packageError = this.packageError();
    const loading = this._defaults.loading();
    const defaultsError = this._defaults.error();
    const target = this.target();

    if (packageError) {
      return packageError;
    }
    if (loading) {
      return 'Loading remote configuration…';
    }
    if (defaultsError) {
      return defaultsError;
    }
    return target ? undefined : 'Configure a remote target to deploy or execute packages.';
  });

  protected openOperation(operation: IdeRemoteOperationType): void {
    if (operation === 'DEPLOY' ? !this.canDeploy() : !this.canExecute()) {
      return;
    }
    this._dialog.open(IdeRemoteOperationDialogComponent, {
      data: { operation },
      width: '48rem',
      maxWidth: 'calc(100vw - 2rem)',
    });
  }
}
