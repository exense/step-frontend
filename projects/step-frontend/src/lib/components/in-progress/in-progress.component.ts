import { ChangeDetectionStrategy, Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { StepCoreModule } from '@exense/step-core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'step-in-progress',
  standalone: true,
  imports: [StepCoreModule],
  templateUrl: './in-progress.component.html',
  styleUrl: './in-progress.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class InProgressComponent implements OnInit {
  private _router = inject(Router);
  private _activatedRoute = inject(ActivatedRoute);

  ngOnInit(): void {
    const goTo = this._activatedRoute.snapshot.data?.['goTo'] as string;
    if (!goTo) {
      return;
    }
    setTimeout(() => this._router.navigateByUrl(goTo, { skipLocationChange: true }), 500);
  }
}
