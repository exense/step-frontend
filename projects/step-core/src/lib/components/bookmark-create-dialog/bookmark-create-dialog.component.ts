import { Component, inject, OnInit } from '@angular/core';
import { Bookmark } from '../../client/generated/models/Bookmark';
import { Router } from '@angular/router';
import { BookmarkService } from '../../services/bookmark.service';
import { getIconAndPageById } from '../../shared';

@Component({
  selector: 'step-bookmark-create-dialog',
  templateUrl: './bookmark-create-dialog.component.html',
  styleUrls: ['./bookmark-create-dialog.component.scss'],
})
export class BookmarkCreateDialogComponent implements OnInit {
  private router = inject(Router);
  private bookmarkService = inject(BookmarkService);
  protected bookmark: Partial<Bookmark> = {};

  ngOnInit(): void {
    const link = this.router.url.slice(6);
    const initBookmark = this.getIconAndPage(link);
    this.bookmark = {
      label: '',
      page: initBookmark?.page,
      link: link,
      tenant: '',
      icon: initBookmark?.icon,
    };
  }

  save(): void {
    this.bookmarkService.createBookmark(this.bookmark);
  }

  private getIconAndPage(link: string): Bookmark | undefined {
    const firstDashIndex = link.indexOf('/');
    const prefix = link.slice(0, firstDashIndex === -1 ? undefined : firstDashIndex);
    return getIconAndPageById(prefix);
  }
}
