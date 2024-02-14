import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DEFAULT_PAGE } from '@exense/step-core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'step-not-found',
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss',
})
export class NotFoundComponent implements OnInit {
  private _router = inject(Router);
  private _snackBar = inject(MatSnackBar);
  private _defaultPage = inject(DEFAULT_PAGE);

  ngOnInit(): void {
    const currentUrl = this._router.url;
    this._snackBar.open(`Page not Found: ${currentUrl}`, 'dismiss');
    this._router.navigateByUrl(this._defaultPage(true));
  }
}
