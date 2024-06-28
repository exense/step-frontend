import { Component, HostListener, inject, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { take } from 'rxjs';
import { MultipleProjectsService, StepBasicsModule } from '../../../basics/step-basics.module';
import { MENU_ITEMS } from '../../../routing';
import { Bookmark } from '../../types/bookmark';
import { AugmentedBookmarksService } from '../../../../client/augmented/services/augmented-bookmarks.service';
import { User, UserService } from '../../../../client/generated';
import { BookmarkService } from '../../injectables/bookmark.service';

@Component({
  selector: 'step-bookmark-create-dialog',
  templateUrl: './bookmark-create-dialog.component.html',
  styleUrls: ['./bookmark-create-dialog.component.scss'],
  imports: [StepBasicsModule],
  standalone: true,
})
export class BookmarkCreateDialogComponent implements OnInit {
  private _router = inject(Router);
  private _matDialogRef = inject(MatDialogRef);
  private _multipleProjects = inject(MultipleProjectsService);
  private _api = inject(AugmentedBookmarksService);
  private _bookmarkService = inject(BookmarkService);
  private _userApi = inject(UserService);
  private user: Partial<User> = {};
  readonly _data = inject<Bookmark | undefined>(MAT_DIALOG_DATA);
  readonly _menuItems$ = inject(MENU_ITEMS);

  protected bookmark: Partial<Bookmark> = {};

  @ViewChild('formContainer', { static: false })
  private form!: NgForm;

  ngOnInit(): void {
    this._userApi.getMyUser().subscribe((user) => {
      this.user = user || {};
    });
    const tenant = this._data?.customFields?.tenant || this._multipleProjects.currentProject()?.name;
    const slashIndex = this._router.url.indexOf('/');
    const link = this._data?.customFields?.link || this._router.url.slice(slashIndex + 1);
    const initBookmark = this.getIconAndPage(link);
    this.bookmark = {
      label: this._data?.customFields?.label ?? '',
      page: this._data?.customFields?.page || initBookmark?.page,
      link,
      tenant,
      icon: this._data?.customFields?.icon || initBookmark?.icon,
    };
  }

  @HostListener('keydown.enter')
  save(): void {
    if (this.form.control.invalid) {
      this.form.control.markAllAsTouched();
      return;
    }
    if (this._data) {
      const bookmark = {
        id: this._data!.id,
        userId: this.user.id!,
        url: this.bookmark.link!,
        customFields: { ...this.bookmark },
      };
      this._api.saveUserBookmark(bookmark).subscribe();
    } else {
      const bookmark = { userId: this.user.id!, url: this.bookmark.link!, customFields: { ...this.bookmark } };
      this._api.saveUserBookmark(bookmark).subscribe();
    }
    this._bookmarkService.refreshBookmarks();
    this._matDialogRef.close();
  }

  private getIconAndPage(link: string): Bookmark | undefined {
    let firstDashIndex: number | undefined = link.indexOf('/');
    let questionMarkIndex: number | undefined = link.indexOf('?');

    firstDashIndex = firstDashIndex === -1 ? undefined : firstDashIndex;
    questionMarkIndex = questionMarkIndex === -1 ? undefined : questionMarkIndex;

    const prefix = link.slice(0, firstDashIndex ?? questionMarkIndex);

    let iconAndPage;
    this._menuItems$.pipe(take(1)).subscribe((items) => {
      const item = items.find((el) => el.id === prefix);
      iconAndPage = { icon: item?.icon, page: item?.title };
    });
    return iconAndPage;
  }
}
