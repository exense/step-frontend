import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { KeyValuePair, Tab } from '@exense/step-core';
import { map, Observable, shareReplay } from 'rxjs';
import { VersionsDialogData } from '../../shared/versions-dialog-data.interface';

enum VersionDialogTabs {
  FE = 'FE',
  BE = 'BE',
}

@Component({
  selector: 'step-versions-dialog',
  templateUrl: './versions-dialog.component.html',
  styleUrls: ['./versions-dialog.component.scss'],
})
export class VersionsDialogComponent implements OnInit {
  readonly tabs: Tab[] = [
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

  versionFEOS?: string;
  versionFEEE?: string;
  activeTabId: string = VersionDialogTabs.FE;
  versions$: Observable<KeyValuePair<string, string>[]> = this._httpClient
    .get<Record<string, string>>(`/rest/controller/lib/versions`)
    .pipe(
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
          ])
        );
        const keyValuePairs: KeyValuePair<string, string>[] = orderedKeys.map((key) => ({
          key,
          value: versions[key],
        }));

        return keyValuePairs;
      }),
      shareReplay(1)
    );

  constructor(private _httpClient: HttpClient, @Inject(MAT_DIALOG_DATA) public _data: VersionsDialogData) {}

  ngOnInit(): void {
    if (this._data.versionFEOS && !this._data.versionFEOS.startsWith('${')) {
      this.versionFEOS = this._data.versionFEOS;
    }

    if (this._data.versionFEEE && !this._data.versionFEEE.startsWith('${')) {
      this.versionFEEE = this._data.versionFEEE;
    }
  }
}
