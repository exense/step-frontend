import { Component, HostListener, inject, OnInit, ViewChild } from '@angular/core';
import { Bookmark } from '../../shared/Bookmark';
import { ActivatedRoute, Router } from '@angular/router';
import { BookmarkService } from '../../services/bookmark.service';
import { NgForm } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

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
  data = inject(MAT_DIALOG_DATA);

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
    if (this.data) {
      this.bookmark.label = this.data;
    }
  }

  @HostListener('keydown.enter')
  save(): void {
    if (this.form.control.invalid) {
      this.form.control.markAllAsTouched();
      return;
    }
    if (this.data) {
      this.bookmarkService.renameBookmark(this.data, this.bookmark.label!);
    } else {
      this.bookmarkService.createBookmark(this.bookmark);
    }
    this._matDialogRef.close();
  }

  private getIconAndPage(link: string): Bookmark | undefined {
    const firstDashIndex = link.indexOf('/');
    const prefix = link.slice(0, firstDashIndex === -1 ? undefined : firstDashIndex);
    return this.getIconAndPageById(prefix);
  }

  private getIconAndPageById = (id: string): Bookmark | undefined => {
    switch (id) {
      case 'functions':
        return { icon: 'keyword', page: 'Keywords' };
        break;
      case 'plans':
        return { icon: 'plan', page: 'Plans' };
        break;
      case 'parameters':
        return { icon: 'list', page: 'Parameters' };
        break;
      case 'scheduler':
        return { icon: 'clock', page: 'Schedules' };
        break;
      case 'dashboards':
        return { icon: 'bar-chart-square-01', page: 'Analytics' };
        break;
      case 'operations':
        return { icon: 'airplay', page: 'Current Operations' };
        break;
      case 'gridagents':
        return { icon: 'agent', page: 'Agents' };
        break;
      case 'gridtokens':
        return { icon: 'agent-token', page: 'Agent tokens' };
        break;
      case 'gridtokengroups':
        return { icon: 'agent-token-group', page: 'Token Groups' };
        break;
      case 'gridquotamanager':
        return { icon: 'sidebar', page: 'Quota Manager' };
        break;
      case 'functionPackages':
        return { icon: 'package', page: 'Keywords packages' };
        break;
      case 'resources':
        return { icon: 'file-attachment-03', page: 'Resources' };
        break;
      case 'automationPackage':
        return { icon: 'automation', page: 'Automation Packages' };
        break;
      case 'executions':
        return { icon: 'rocket', page: 'Executions' };
        break;
      default:
        return undefined;
    }
  };
}
