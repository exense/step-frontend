import { Component, OnDestroy } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import {
  AJS_MODULE,
  Input,
  Option,
  DialogsService,
  AuthService,
  a1Promise2Observable,
  ContextService,
  Mutable,
  TableLocalDataSource,
  ScreensService
} from '@exense/step-core';
import { BehaviorSubject, switchMap, of, catchError, noop, shareReplay, tap, map } from 'rxjs';
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

  readonly _screenChoicesRequest$ = this._screensService.getScreens();

  private _screensRequest$ = new BehaviorSubject<unknown>({});
  private screens$ = this._screensRequest$.pipe(
    tap((_) => ((this as InProgress).inProgress = true)),
    switchMap((_) => this._screensService.getScreenInputsByScreenId(this.currentlySelectedScreenChoice)),
    tap((_) => ((this as InProgress).inProgress = false)),
    shareReplay(1)
  );

  readonly searchableScreens$ = new TableLocalDataSource(this.screens$, {
    searchPredicates: {
      label: (item, searchValue) => item.input.label.toLowerCase().includes(searchValue.toLowerCase()),
      id: (item, searchValue) => item.input.id.toLowerCase().includes(searchValue.toLowerCase()),
      type: (item, searchValue) => item.input.type.toLowerCase().includes(searchValue.toLowerCase()),
      options: (item, searchValue) =>
        this.optionsToString(item.input?.options).toLowerCase().includes(searchValue.toLowerCase()),
      activationScript: (item, searchValue) =>
        item.input?.activationExpression?.script.toLowerCase().includes(searchValue.toLowerCase()),
    },
  });

  readonly currentUserName: string;
  readonly inProgress: boolean = false;

  constructor(
    private _screensService: ScreensService,
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

  editScreen(screenInput: Input, screenDbId: string): void {
    this._screenDialogs.editScreen(screenInput, screenDbId, undefined).subscribe((_) => this.loadTable());
  }

  moveScreen(dbId: string, offset: number): void {
    this._screensService.moveInput(dbId, offset).subscribe((_) => this.loadTable());
  }

  removeScreen(dbId: string, label: string): void {
    a1Promise2Observable(this._dialogs.showDeleteWarning(1, `Screen "${label}"`))
      .pipe(
        switchMap((_) => this._screensService.deleteInput(dbId)),
        map((_) => true),
        catchError((_) => of(false))
      )
      .subscribe((result: boolean) => {
        if (result) {
          this.loadTable();
        }
      });
  }

  optionsToString(options: Array<Option>): string {
    return options ? options.map((option: Option) => option.value).toString() : '';
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
