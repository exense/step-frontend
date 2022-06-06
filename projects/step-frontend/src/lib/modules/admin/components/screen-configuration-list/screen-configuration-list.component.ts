import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import {
  AJS_MODULE,
  ScreenDto,
  ScreenInputDto,
  ScreenInputOptionDto,
  ScreenInputActivationExpressionDto,
  DialogsService,
  AuthService,
  a1Promise2Observable,
  ContextService,
  Mutable,
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
  readonly screens$ = this._screensRequest$.pipe(
    tap((_) => ((this as InProgress).inProgress = true)),
    switchMap((_) =>
      this._screenApi.getScreenByScreenChoice(this.currentlySelectedScreenChoice).pipe(
        map((screens: ScreenDto[]) =>
          screens.map((screen: ScreenDto) => {
            const screenInput: ScreenInputDto & {
              searchableOptionsValueString?: string;
              searchableActivationExprValueString?: string;
              dbId?: string;
            } = screen.input;
            screenInput.searchableOptionsValueString = screenInput?.options
              ?.map((option: ScreenInputOptionDto) => option.value)
              .toString();
            screenInput.searchableActivationExprValueString = screenInput?.activationExpression?.script;
            screenInput.dbId = screen.id;
            return screenInput;
          })
        )
      )
    ),
    tap((_) => ((this as InProgress).inProgress = false)),
    shareReplay(1)
  );

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
    this._screenDialogs.editScreen(undefined, this.currentlySelectedScreenChoice).subscribe((_) => this.loadTable());
  }

  editScreen(screenInput: ScreenInputDto & { dbId: string }): void {
    this._screenDialogs.editScreen(screenInput, undefined).subscribe((_) => this.loadTable());
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
