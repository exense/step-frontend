import { Component, computed, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { AlertType, StepBasicsModule } from '../../../basics/step-basics.module';
import { InfoBannerService } from '../../injectables/info-banner.service';

@Component({
  selector: 'step-info-banner',
  templateUrl: './info-banner.component.html',
  styleUrl: './info-banner.component.scss',
  imports: [StepBasicsModule],
  standalone: true,
})
export class InfoBannerComponent {
  private _infoBannerService = inject(InfoBannerService);
  private _domSanitizer = inject(DomSanitizer);

  protected readonly AlertType = AlertType;
  protected readonly info = computed(() => {
    const info = this._infoBannerService.actualInfo();
    if (!info) {
      return undefined;
    }
    return this._domSanitizer.bypassSecurityTrustHtml(info);
  });

  closeBanner(): void {
    this._infoBannerService.hideInfoForActualView().subscribe();
  }
}
