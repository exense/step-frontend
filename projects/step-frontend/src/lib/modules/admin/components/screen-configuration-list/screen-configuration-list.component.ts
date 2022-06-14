import { Component, OnDestroy } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import {
  AJS_MODULE,
  ScreenInputDto,
  ScreenInputOptionDto,
  DialogsService,
  AuthService,
  a1Promise2Observable,
  ContextService,
  Mutable,
  TableLocalDataSource,
  ScreenDto,
} from '@exense/step-core';
import { BehaviorSubject, switchMap, of, catchError, noop, shareReplay, tap, map } from 'rxjs';
import { ScreenApiService } from '../../services/screen-api.service';
import { ScreenDialogsService } from '../../services/screen-dialogs.service';

type InProgress = Mutable<Pick<ScreenConfigurationListComponent, 'inProgress'>>;

@Component({
  selector: 'step-screen-configuration-list',
  templateUrl: './screen-configuration-list.component.html',
  styleUrls: ['./screen-configuration-list.component.scss'],
})
export class ScreenConfigurationListComponent implements OnDestroy {
  public readonly CURRENT_SCREEN_CHOICE_DEFAULT = 'executionParameters';

  public currentlySelectedScreenChoice: string = this.CURRENT_SCREEN_CHOICE_DEFAULT;

  readonly _screenChoicesRequest$ = this._screenApi.getScreenChoices();

  private _screensRequest$ = new BehaviorSubject<unknown>({});
  private screens$ = this._screensRequest$.pipe(
    tap((_) => ((this as InProgress).inProgress = true)),
    switchMap((_) => this._screenApi.getScreenByScreenChoice(this.currentlySelectedScreenChoice)),
    tap((_) => ((this as InProgress).inProgress = false)),
    shareReplay(1)
  );

  readonly searchableScreens$ = new TableLocalDataSource(this.screens$, {
    searchPredicates: {
      label: (item: ScreenDto, searchValue: string) =>
        item.input!.label!.toLowerCase().includes(searchValue.toLowerCase()),
      id: (item: ScreenDto, searchValue: string) => item.input!.id!.toLowerCase().includes(searchValue.toLowerCase()),
      type: (item: ScreenDto, searchValue: string) =>
        item.input!.type!.toLowerCase().includes(searchValue.toLowerCase()),
      options: (item: ScreenDto, searchValue: string) =>
        this.optionsToString(item.input?.options).toLowerCase().includes(searchValue.toLowerCase()),
      activationScript: (item: ScreenDto, searchValue: string) =>
        item.input!.activationExpression!.script!.toLowerCase().includes(searchValue.toLowerCase()),
    },
  });

  readonly currentUserName: string;
  readonly inProgress: boolean = false;

  constructor(
    private _screenApi: ScreenApiService,
    private _dialogs: DialogsService,
    private _screenDialogs: ScreenDialogsService,
    private _auth: AuthService,
    context: ContextService
  ) {
    this.currentUserName = context.userName;
  }

  public reloadTableForCurrentChoice(choice: string) {
    this.currentlySelectedScreenChoice = choice;
    this.loadTable();
  }

  addScreen(): void {
    this._screenDialogs
      .editScreen(undefined, undefined, this.currentlySelectedScreenChoice)
      .subscribe((_) => this.loadTable());
  }

  editScreen(screenInput: ScreenInputDto, screenDbId: string): void {
    this._screenDialogs.editScreen(screenInput, screenDbId, undefined).subscribe((_) => this.loadTable());
  }

  moveScreen(dbId: string, offset: number): void {
    this._screenApi.moveScreenPosition(dbId, offset).subscribe((_) => this.loadTable());
  }

  removeScreen(dbId: string, label: string): void {
    a1Promise2Observable(this._dialogs.showDeleteWarning(1, `Screen "${label}"`))
      .pipe(
        switchMap((_) => this._screenApi.removeScreen(dbId)),
        map((_) => true),
        catchError((_) => of(false))
      )
      .subscribe((result: boolean) => {
        if (result) {
          this.loadTable();
        }
      });
  }

  optionsToString(options?: Array<ScreenInputOptionDto>): string {
    return options ? options.map((option: ScreenInputOptionDto) => option.value).toString() : '';
  }

  private loadTable(): void {
    this._screensRequest$.next({});
  }

  ngOnDestroy(): void {
    this._screensRequest$.complete();
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepScreenConfigurationList', downgradeComponent({ component: ScreenConfigurationListComponent }));
