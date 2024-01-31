import { Component, forwardRef, inject } from '@angular/core';
import {
  TableFetchLocalDataSource,
  ScreenInput,
  MultipleProjectsService,
  AugmentedScreenService,
  DialogsService,
  DialogParentService,
} from '@exense/step-core';
import { RenderOptionsPipe } from '../../pipes/render-options.pipe';
import { filter, switchMap } from 'rxjs';
import { Router } from '@angular/router';

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
})
export class ScreenConfigurationListComponent implements DialogParentService {
  private _screenApi = inject(AugmentedScreenService);
  private _dialogs = inject(DialogsService);
  private _renderOptions = inject(RenderOptionsPipe);
  private _multipleProjectList = inject(MultipleProjectsService);
  private _router = inject(Router);

  public readonly CURRENT_SCREEN_CHOICE_DEFAULT = 'executionParameters';

  public currentlySelectedScreenChoice: string = this.CURRENT_SCREEN_CHOICE_DEFAULT;

  readonly _screenChoicesRequest$ = this._screenApi.getScreens();
  readonly searchableScreens = new TableFetchLocalDataSource(
    () => this._screenApi.getScreenInputsByScreenId(this.currentlySelectedScreenChoice),
    TableFetchLocalDataSource.configBuilder<ScreenInput>()
      .addSearchStringPredicate('label', (item) => item.input!.label!)
      .addSearchStringPredicate('id', (item) => item.input!.id!)
      .addSearchStringPredicate('type', (item) => item.input!.type!)
      .addSearchStringPredicate('options', (item) => this._renderOptions.transform(item.input!.options!))
      .addSearchStringPredicate('activationScript', (item) => item.input!.activationExpression!.script!)
      .build()
  );

  private get baseScreenConfigurationUrl(): string {
    const screensSegment = 'screens';
    let url = this._router.url;
    if (url.includes(screensSegment)) {
      url = url.slice(0, url.indexOf(screensSegment) + screensSegment.length);
    }
    return url;
  }

  readonly returnParentUrl = this.baseScreenConfigurationUrl;

  dialogSuccessfullyClosed(): void {
    this.searchableScreens.reload();
  }

  reloadTableForCurrentChoice(choice: string) {
    this.currentlySelectedScreenChoice = choice;
    this.searchableScreens.reload();
  }

  addScreen(): void {
    this._router.navigateByUrl(`${this.baseScreenConfigurationUrl}/editor/new/${this.currentlySelectedScreenChoice}`);
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
    this._screenApi.moveInput(dbId, offset).subscribe(() => this.searchableScreens.reload());
  }

  removeScreen(dbId: string, label: string): void {
    this._dialogs
      .showDeleteWarning(1, `Screen "${label}"`)
      .pipe(
        filter((result) => result),
        switchMap(() => this._screenApi.deleteInput(dbId))
      )
      .subscribe(() => this.searchableScreens.reload());
  }
}
