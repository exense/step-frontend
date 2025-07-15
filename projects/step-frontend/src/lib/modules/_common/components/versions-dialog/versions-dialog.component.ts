import { Component, inject } from '@angular/core';
import { ControllerService, KeyValuePair, Tab } from '@exense/step-core';
import { map, Observable, shareReplay } from 'rxjs';

enum VersionDialogTabs {
  FE = 'FE',
  BE = 'BE',
}

@Component({
  selector: 'step-versions-dialog',
  templateUrl: './versions-dialog.component.html',
  styleUrls: ['./versions-dialog.component.scss'],
  standalone: false,
})
export class VersionsDialogComponent {
  private _controllerService = inject(ControllerService);

  readonly tabs: Tab<VersionDialogTabs>[] = [
    {
      id: VersionDialogTabs.FE,
      label: 'FrontEnd',
    },
    {
      id: VersionDialogTabs.BE,
      label: 'BackEnd',
    },
  ];
  readonly VersionDialogTabs = VersionDialogTabs;

  activeTabId: string = VersionDialogTabs.FE;
  versions$: Observable<KeyValuePair<string, string>[]> = this._controllerService.getLibVersions().pipe(
    map((versions) => {
      const stepEnterpriseController = 'step-enterprise-controller';
      const stepControllerBackend = 'step-controller-backend';
      const orderedKeys = Array.from(
        new Set([
          // business requirement - stepEnterpriseController at the top,
          // followed by stepControllerBackend, followed by the rest
          stepEnterpriseController,
          stepControllerBackend,
          ...Object.keys(versions).sort((a, b) => a.localeCompare(b)),
        ]),
      );
      const keyValuePairs: KeyValuePair<string, string>[] = orderedKeys.map((key) => ({
        key,
        value: versions[key],
      }));

      return keyValuePairs;
    }),
    shareReplay(1),
  );
}
