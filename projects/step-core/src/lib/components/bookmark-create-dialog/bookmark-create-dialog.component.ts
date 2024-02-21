import { Component, HostListener, inject, OnInit, ViewChild } from '@angular/core';
import { Bookmark } from '../../client/generated/models/Bookmark';
import { ActivatedRoute, Router } from '@angular/router';
import { BookmarkService } from '../../services/bookmark.service';
import { getIconAndPageById } from '../../shared';
import { NgForm } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'step-bookmark-create-dialog',
  templateUrl: './bookmark-create-dialog.component.html',
  styleUrls: ['./bookmark-create-dialog.component.scss'],
})
export class BookmarkCreateDialogComponent implements OnInit {
  private router = inject(Router);
  private bookmarkService = inject(BookmarkService);
  private _matDialogRef = inject(MatDialogRef);
  private route = inject(ActivatedRoute);

  protected bookmark: Partial<Bookmark> = {};

  @ViewChild('formContainer', { static: false })
  private form!: NgForm;

  ngOnInit(): void {
    const tenant = this.route.snapshot.queryParams['tenant'];
    const slashIndex = this.router.url.indexOf('/');
    const link = this.router.url.slice(slashIndex + 1).split('?')[0];
    const initBookmark = this.getIconAndPage(link);
    this.bookmark = {
      label: '',
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
    this.bookmarkService.createBookmark(this.bookmark);
    this._matDialogRef.close();
  }

  private getIconAndPage(link: string): Bookmark | undefined {
    const firstDashIndex = link.indexOf('/');
    const prefix = link.slice(0, firstDashIndex === -1 ? undefined : firstDashIndex);
    return getIconAndPageById(prefix);
  }
}
