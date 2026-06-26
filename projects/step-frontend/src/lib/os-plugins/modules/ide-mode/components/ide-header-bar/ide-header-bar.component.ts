import {Component, inject} from '@angular/core';
import {CustomComponent, IdeService, StepCoreModule} from '@exense/step-core';
import {MatDialog} from '@angular/material/dialog';
import {FolderPickerModalComponent} from '../folder-picker-modal/folder-picker-modal.component';
import {filter, switchMap} from 'rxjs';

@Component({
  selector: 'step-ide-header-bar',
  imports: [StepCoreModule],
  templateUrl: './ide-header-bar.component.html',
  styleUrl: './ide-header-bar.component.scss'
})
export class IdeHeaderBarComponent implements CustomComponent {

  private _matDialog = inject(MatDialog);
  private _ide = inject(IdeService);

  context?: unknown;

  protected createPackage(): void {
    this._matDialog.open(FolderPickerModalComponent, {data: ''}).afterClosed()
      .pipe(
        filter((folderName) => !!folderName),
        switchMap((folderName) => this._ide.initializeNewAp(folderName, 'mayApp'))
      )
      .subscribe(console.log);
  }

}
