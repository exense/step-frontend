import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RemoteDeploymentRequest, StepIconsModule } from '@exense/step-core';

@Component({
  selector: 'step-ide-remote-deployment-options',
  templateUrl: './ide-remote-deployment-options.component.html',
  styleUrl: '../ide-remote-options.scss',
  imports: [StepIconsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IdeRemoteDeploymentOptionsComponent {
  readonly request = input<RemoteDeploymentRequest>();

  protected readonly options = computed(() => {
    const request = this.request();
    if (!request) {
      return [];
    }
    const options: { label: string; value: string }[] = [];
    const add = (label: string, value: string | number | boolean | undefined): void => {
      if (value !== undefined && value !== null) {
        options.push({ label, value: typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value) });
      }
    };
    add('Step user', request.connection?.stepUser);
    add('Library', request.library);
    add('Asynchronous deployment', request.async);
    add('Version name', request.versionName);
    add('Activation expression', request.activationExpression);
    add('Force refresh of snapshots', request.forceRefreshOfSnapshots);
    add('Deployment timeout', request.deploymentTimeout);
    add('Execute keywords on controller', request.executeKeywordsOnController);
    return options;
  });
  protected readonly attributeGroups = computed(() => {
    const request = this.request();
    return [
      { label: 'Plan attributes', entries: Object.entries(request?.plansAttributes ?? {}) },
      { label: 'Keyword attributes', entries: Object.entries(request?.keywordsAttributes ?? {}) },
      { label: 'Token selection criteria', entries: Object.entries(request?.tokenSelectionCriteria ?? {}) },
    ].filter((group) => group.entries.length);
  });
}
