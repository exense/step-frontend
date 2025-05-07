import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DEFAULT_PAGE, ErrorMessageHandlerService } from '@exense/step-core';

@Component({
  selector: 'step-not-found',
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss',
})
export class NotFoundComponent implements OnInit {
  private _router = inject(Router);
  private _errorMessageHandler = inject(ErrorMessageHandlerService);
  private _defaultPage = inject(DEFAULT_PAGE);

  ngOnInit(): void {
    const currentUrl = this._router.url;
    this._errorMessageHandler.showError(`Page not Found: ${currentUrl}`);
    this._router.navigateByUrl(this._defaultPage(true));
  }
}
