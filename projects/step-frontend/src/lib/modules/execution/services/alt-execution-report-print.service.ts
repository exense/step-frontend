import { inject, Injectable, OnDestroy } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { from, switchMap, timer } from 'rxjs';

@Injectable()
export class AltExecutionReportPrintService implements OnDestroy {
  private _doc = inject(DOCUMENT);
  private _router = inject(Router);
  private _activatedRoute = inject(ActivatedRoute);

  private handleAfterPrint = () => this.afterPrint();

  ngOnDestroy() {
    this._doc.defaultView?.removeEventListener('afterprint', this.handleAfterPrint);
  }

  printFiltered(): void {
    this.print();
  }

  printAll(): void {
    this.print(true);
  }

  private print(isPrintAll?: boolean): void {
    this._doc.defaultView?.addEventListener('afterprint', this.handleAfterPrint);

    from(
      this._router.navigate(['.', 'report-print'], {
        relativeTo: this._activatedRoute,
        queryParams: {
          viewAll: isPrintAll || null,
        },
        queryParamsHandling: 'merge',
      }),
    )
      .pipe(switchMap(() => timer(500)))
      .subscribe(() => {
        this._doc.defaultView?.print();
      });
  }

  private afterPrint(): void {
    this._doc.defaultView?.removeEventListener('afterprint', this.handleAfterPrint);
    this._router.navigate(['.', 'report'], {
      relativeTo: this._activatedRoute,
      queryParams: { viewAll: null },
      queryParamsHandling: 'merge',
    });
  }
}
