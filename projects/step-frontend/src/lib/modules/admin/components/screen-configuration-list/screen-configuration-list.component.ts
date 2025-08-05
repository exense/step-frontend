import { Component, DestroyRef, forwardRef, inject, OnInit } from '@angular/core';
import {
  TableFetchLocalDataSource,
  ScreenInput,
  MultipleProjectsService,
  DialogsService,
  DialogParentService,
  AugmentedScreenService,
} from '@exense/step-core';
import { RenderOptionsPipe } from '../../pipes/render-options.pipe';
import { filter, map, of, switchMap, take } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'step-screen-configuration-list',
  templateUrl: './screen-configuration-list.component.html',
  styleUrls: ['./screen-configuration-list.component.scss'],
  providers: [
    {
      provide: DialogParentService,
      useExisting: forwardRef(() => ScreenConfigurationListComponent),
    },
  ],
  standalone: false,
})
export class ScreenConfigurationListComponent implements DialogParentService, OnInit {
  private _destroyRef = inject(DestroyRef);
  private _activatedRoute = inject(ActivatedRoute);
  private _screenApi = inject(AugmentedScreenService);
  private _dialogs = inject(DialogsService);
  private _renderOptions = inject(RenderOptionsPipe);
  private _multipleProjectList = inject(MultipleProjectsService);
  private _router = inject(Router);

  protected readonly screenChoicesRequest = toSignal(
    this._activatedRoute.data.pipe(map((data) => data['availableScreens'] as string[])),
    { initialValue: [] },
  );

  protected currentlySelectedScreenChoice?: string;

  readonly searchableScreens = new TableFetchLocalDataSource(
    () =>
      this.currentlySelectedScreenChoice
        ? this._screenApi.getScreenInputsByScreenId(this.currentlySelectedScreenChoice)
        : of([]),
    TableFetchLocalDataSource.configBuilder<ScreenInput>()
      .addSearchStringPredicate('label', (item) => item.input!.label!)
      .addSearchStringPredicate('id', (item) => item.input!.id!)
      .addSearchStringPredicate('type', (item) => item.input!.type!)
      .addSearchStringPredicate('options', (item) => this._renderOptions.transform(item.input!.options!))
      .addSearchStringPredicate('activationScript', (item) => item.input!.activationExpression!.script!)
      .build(),
  );

  private get baseScreenConfigurationUrl(): string {
    const screensSegment = this.currentlySelectedScreenChoice;
    let url = this._router.url;
    if (screensSegment && url.includes(screensSegment)) {
      url = url.slice(0, url.indexOf(screensSegment) + screensSegment.length);
    }
    return url;
  }

  get returnParentUrl(): string {
    return this.baseScreenConfigurationUrl;
  }

  ngOnInit(): void {
    this._activatedRoute.params
      .pipe(
        map((params) => params['screenId']),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe((screenId) => {
        this.currentlySelectedScreenChoice = screenId;
        this.searchableScreens.reload();
      });
  }

  dialogSuccessfullyClosed(): void {
    this.searchableScreens.reload();
  }

  reloadTableForCurrentChoice(choice: string) {
    this._router.navigate(['..', choice], { relativeTo: this._activatedRoute });
  }

  addScreen(): void {
    this.searchableScreens.total$
      .pipe(takeUntilDestroyed(this._destroyRef), take(1))
      .subscribe((data) =>
        this._router.navigateByUrl(`${this.baseScreenConfigurationUrl}/editor/new?nextIndex=${data}`),
      );
  }

  editScreen(screen: ScreenInput): void {
    const url = `${this.baseScreenConfigurationUrl}/editor/${screen.id!}`;
    if (this._multipleProjectList.isEntityBelongsToCurrentProject(screen)) {
      this._router.navigateByUrl(url);
      return;
    }

    this._multipleProjectList
      .confirmEntityEditInASeparateProject(screen, url, 'screen input')
      .subscribe((continueEdit) => {
        if (continueEdit) {
          this._router.navigateByUrl(url);
        }
      });
  }

  moveScreen(dbId: string, offset: number): void {
    this._screenApi
      .moveInput(dbId, offset, this.currentlySelectedScreenChoice)
      .subscribe(() => this.searchableScreens.reload());
  }

  removeScreen(dbId: string, label: string): void {
    this._dialogs
      .showDeleteWarning(1, `Screen "${label}"`)
      .pipe(
        filter((result) => result),
        switchMap(() => this._screenApi.deleteInput(dbId, this.currentlySelectedScreenChoice)),
      )
      .subscribe(() => this.searchableScreens.reload());
  }
}
