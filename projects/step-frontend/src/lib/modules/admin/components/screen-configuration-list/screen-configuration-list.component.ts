import { AfterViewInit, Component, inject } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import {
  AJS_MODULE,
  ScreensService,
  TableFetchLocalDataSource,
  ScreenInput,
  MultipleProjectsService,
  EditorResolverService,
  AJS_LOCATION,
} from '@exense/step-core';
import { ScreenDialogsService } from '../../services/screen-dialogs.service';
import { RenderOptionsPipe } from '../../pipes/render-options.pipe';
import { pipe, take, tap } from 'rxjs';

const SCREEN_ID = 'screenId';

@Component({
  selector: 'step-screen-configuration-list',
  templateUrl: './screen-configuration-list.component.html',
  styleUrls: ['./screen-configuration-list.component.scss'],
})
export class ScreenConfigurationListComponent implements AfterViewInit {
  private _screensService = inject(ScreensService);
  private _screenDialogs = inject(ScreenDialogsService);
  private _renderOptions = inject(RenderOptionsPipe);
  private _multipleProjectList = inject(MultipleProjectsService);
  private _editorResolver = inject(EditorResolverService);
  private _$location = inject(AJS_LOCATION);

  private updateDataSourceAfterChange = pipe(
    tap((result?: boolean) => {
      if (result) {
        this.searchableScreens.reload();
      }
    })
  );

  private updateDataSource = pipe(tap(() => this.searchableScreens.reload()));

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

  ngAfterViewInit(): void {
    this._editorResolver
      .onEditEntity(SCREEN_ID)
      .pipe(take(1))
      .subscribe((screenId) => {
        this.editScreenInternal(screenId);
      });
  }

  reloadTableForCurrentChoice(choice: string) {
    this.currentlySelectedScreenChoice = choice;
    this.searchableScreens.reload();
  }

  addScreen(): void {
    this._screenDialogs
      .editScreen({ screenId: this.currentlySelectedScreenChoice })
      .pipe(this.updateDataSourceAfterChange)
      .subscribe();
  }

  editScreen(screen: ScreenInput): void {
    if (this._multipleProjectList.isEntityBelongsToCurrentProject(screen)) {
      this.editScreenInternal(screen.id!);
      return;
    }

    const screenLink = this._$location.path();
    const screenEditParams = { [SCREEN_ID]: screen.id! };
    this._multipleProjectList
      .confirmEntityEditInASeparateProject(screen, { url: screenLink, search: screenEditParams }, 'screen input')
      .subscribe((continueEdit) => {
        if (continueEdit) {
          this.editScreenInternal(screen.id!);
        }
      });
  }

  moveScreen(dbId: string, offset: number): void {
    this._screensService.moveInput(dbId, offset).pipe(this.updateDataSource).subscribe();
  }

  removeScreen(dbId: string, label: string): void {
    this._screenDialogs.removeScreen(dbId, label).pipe(this.updateDataSourceAfterChange).subscribe();
  }

  private editScreenInternal(inputId: string): void {
    this._screenDialogs.editScreen({ inputId }).pipe(this.updateDataSourceAfterChange).subscribe();
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepScreenConfigurationList', downgradeComponent({ component: ScreenConfigurationListComponent }));
