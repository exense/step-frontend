import { Component } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE, Input, Option, ScreensService, TableFetchLocalDataSource, ScreenInput } from '@exense/step-core';
import { ScreenDialogsService } from '../../services/screen-dialogs.service';
import { RenderOptionsPipe } from '../../pipes/render-options.pipe';

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
    TableFetchLocalDataSource.configBuilder<ScreenInput>()
      .addSearchStringPredicate('label', (item) => item.input!.label!)
      .addSearchStringPredicate('id', (item) => item.input!.id!)
      .addSearchStringPredicate('type', (item) => item.input!.type!)
      .addSearchStringPredicate('options', (item) => this._renderOptions.transform(item.input!.options!))
      .addSearchStringPredicate('activationScript', (item) => item.input!.activationExpression!.script!)
      .build()
  );

  constructor(
    private _screensService: ScreensService,
    private _screenDialogs: ScreenDialogsService,
    private _renderOptions: RenderOptionsPipe
  ) {}

  reloadTableForCurrentChoice(choice: string) {
    this.currentlySelectedScreenChoice = choice;
    this.loadTable();
  }

  addScreen(): void {
    this._screenDialogs.editScreen({ screenId: this.currentlySelectedScreenChoice }).subscribe((isSaved) => {
      if (isSaved) {
        this.loadTable();
      }
    });
  }

  editScreen(inputId: string): void {
    this._screenDialogs.editScreen({ inputId }).subscribe((isSaved) => {
      if (isSaved) {
        this.loadTable();
      }
    });
  }

  moveScreen(dbId: string, offset: number): void {
    this._screensService.moveInput(dbId, offset).subscribe(() => this.loadTable());
  }

  removeScreen(dbId: string, label: string): void {
    this._screenDialogs.removeScreen(dbId, label).subscribe((result: boolean) => {
      if (result) {
        this.loadTable();
      }
    });
  }

  private loadTable(): void {
    this.searchableScreens.reload();
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepScreenConfigurationList', downgradeComponent({ component: ScreenConfigurationListComponent }));
