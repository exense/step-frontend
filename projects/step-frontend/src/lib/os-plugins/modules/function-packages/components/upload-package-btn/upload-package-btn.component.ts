import { Component } from '@angular/core';
import { CustomComponent } from '@exense/step-core';

@Component({
  selector: 'step-upload-package-btn',
  templateUrl: './upload-package-btn.component.html',
  styleUrls: ['./upload-package-btn.component.scss'],
  standalone: false,
})
export class UploadPackageBtnComponent implements CustomComponent {
  context?: any;
}
