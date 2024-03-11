import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import {
  ArtefactInfo,
  AuthService,
  ControllerService,
  RepositoryObjectReference,
  IncludeTestcases,
  ExecutiontTaskParameters,
  ScheduledTaskTemporaryStorageService,
} from '@exense/step-core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'step-repository',
  templateUrl: './repository.component.html',
  styleUrls: ['./repository.component.scss'],
  host: {
    class: 'container',
  },
})
export class RepositoryComponent implements OnInit {
  private _auth = inject(AuthService);
  private _controllersApi = inject(ControllerService);
  private _activatedRoute = inject(ActivatedRoute);
  private _scheduledTaskTemporaryStorage = inject(ScheduledTaskTemporaryStorageService);
  private _router = inject(Router);
  private _cd = inject(ChangeDetectorRef);

  protected includedTestcases?: IncludeTestcases;

  protected loading: boolean = false;
  protected isolateExecution: boolean = false;

  protected repoRef?: RepositoryObjectReference;

  protected artefact?: ArtefactInfo;

  protected error?: Error;

  ngOnInit(): void {
    this.setupLocationParams();
    this.loadArtefact();
  }

  handleIncludedTestCasesChange(includedTestcases: IncludeTestcases): void {
    this.includedTestcases = includedTestcases;
    this._cd.detectChanges();
  }
  handleTaskSchedule(task: ExecutiontTaskParameters): void {
    const temporaryId = this._scheduledTaskTemporaryStorage.set(task);
    this._router.navigate(['..', 'schedule', temporaryId], { relativeTo: this._activatedRoute });
  }

  private setupLocationParams(): void {
    const search = this._activatedRoute.snapshot.queryParams;
    this.isolateExecution = !!search['isolate'];

    if (search['user']) {
      this._auth.updateContext({ userID: search['user'] });
    }

    if (search['repositoryId']) {
      this.repoRef = {
        repositoryID: search['repositoryId'],
        repositoryParameters: Object.entries(search).reduce(
          (result, [key, value]) => {
            if (!['repositoryId', 'tenant'].includes(key)) {
              result[key] = value as string;
            }
            return result;
          },
          {} as Record<string, string>,
        ),
      };
    }
  }

  private loadArtefact(): void {
    this.loading = true;
    this._controllersApi.getArtefactInfo(this.repoRef).subscribe({
      next: (artefact) => (this.artefact = artefact),
      error: (error) => (this.error = error),
      complete: () => (this.loading = false),
    });
  }
}
