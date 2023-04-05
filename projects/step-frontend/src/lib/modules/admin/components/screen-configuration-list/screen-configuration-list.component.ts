import { Component, OnDestroy } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import {
  AJS_MODULE,
  Input,
  Option,
  Mutable,
  TableLocalDataSource,
  ScreensService,
  TableFetchLocalDataSource,
} from '@exense/step-core';
import { BehaviorSubject, switchMap, shareReplay, tap } from 'rxjs';
import { ScreenDialogsService } from '../../services/screen-dialogs.service';

@Component({
  selector: 'step-screen-configuration-list',
  templateUrl: './screen-configuration-list.component.html',
  styleUrls: ['./screen-configuration-list.component.scss'],
})
export class ScreenConfigurationListComponent {
  public readonly CURRENT_SCREEN_CHOICE_DEFAULT = 'executionParameters';

  public currentlySelectedScreenChoice: string = this.CURRENT_SCREEN_CHOICE_DEFAULT;

  readonly _screenChoicesRequest$ = this._screensService.getScreens();
  readonly searchableScreens = new TableFetchLocalDataSource(
    () => this._screensService.getScreenInputsByScreenId(this.currentlySelectedScreenChoice),
    {
      searchPredicates: {
        label: (item, searchValue) => item.input!.label!.toLowerCase().includes(searchValue.toLowerCase()),
        id: (item, searchValue) => item.input!.id!.toLowerCase().includes(searchValue.toLowerCase()),
        type: (item, searchValue) => item.input!.type!.toLowerCase().includes(searchValue.toLowerCase()),
        options: (item, searchValue) =>
          this.optionsToString(item.input!.options).toLowerCase().includes(searchValue.toLowerCase()),
        activationScript: (item, searchValue) =>
          item.input!.activationExpression!.script!.toLowerCase().includes(searchValue.toLowerCase()),
      },
    }
  );

  constructor(private _screensService: ScreensService, private _screenDialogs: ScreenDialogsService) {}

  reloadTableForCurrentChoice(choice: string) {
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
    this._screenDialogs.removeScreen(dbId, label).subscribe((result: boolean) => {
      if (result) {
        this.loadTable();
      }
    });
  }

  optionsToString(options?: Array<Option>): string {
    return options ? options.map((option: Option) => option.value).toString() : '';
  }

  private loadTable(): void {
    this.searchableScreens.reload();
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepScreenConfigurationList', downgradeComponent({ component: ScreenConfigurationListComponent }));
