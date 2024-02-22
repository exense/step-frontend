import { Component, HostListener, inject, OnInit, ViewChild } from '@angular/core';
import { Bookmark } from '../../shared/bookmark';
import { Router } from '@angular/router';
import { BookmarkService } from '../../services/bookmark.service';
import { NgForm } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MultipleProjectsService } from '../../modules/basics/services/multiple-projects.service';
import { take } from 'rxjs';
import { MENU_ITEMS } from '../../services/menu-items';

@Component({
  selector: 'step-bookmark-create-dialog',
  templateUrl: './bookmark-create-dialog.component.html',
  styleUrls: ['./bookmark-create-dialog.component.scss'],
})
export class BookmarkCreateDialogComponent implements OnInit {
  private _router = inject(Router);
  private _bookmarkService = inject(BookmarkService);
  private _matDialogRef = inject(MatDialogRef);
  private _multipleProjects = inject(MultipleProjectsService);
  readonly _data = inject<string | undefined>(MAT_DIALOG_DATA);
  readonly _menuItems$ = inject(MENU_ITEMS);

  protected bookmark: Partial<Bookmark> = {};

  @ViewChild('formContainer', { static: false })
  private form!: NgForm;

  ngOnInit(): void {
    const tenant = this._multipleProjects.currentProject()?.name;
    const slashIndex = this._router.url.indexOf('/');
    const link = this._router.url.slice(slashIndex + 1).split('?')[0];
    const initBookmark = this.getIconAndPage(link);
    this.bookmark = {
      label: this._data ?? '',
      page: initBookmark?.page,
      link,
      tenant,
      icon: initBookmark?.icon,
    };
  }

  @HostListener('keydown.enter')
  save(): void {
    if (this.form.control.invalid) {
      this.form.control.markAllAsTouched();
      return;
    }
    if (this._data) {
      this._bookmarkService.renameBookmark(this._data, this.bookmark.label!);
    } else {
      this._bookmarkService.createBookmark(this.bookmark);
    }
    this._matDialogRef.close();
  }

  private getIconAndPage(link: string): Bookmark | undefined {
    const firstDashIndex = link.indexOf('/');
    const prefix = link.slice(0, firstDashIndex === -1 ? undefined : firstDashIndex);
    let iconAndPage;
    this._menuItems$.pipe(take(1)).subscribe((items) => {
      const item = items.find((el) => el.id === prefix);
      iconAndPage = { icon: item?.icon, page: item?.title };
    });
    return iconAndPage;
  }
}
