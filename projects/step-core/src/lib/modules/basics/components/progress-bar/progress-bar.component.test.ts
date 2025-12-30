import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProgressBarComponent, StepBasicsModule } from '@exense/step-core';
import { MatProgressBar } from '@angular/material/progress-bar';
import { By } from '@angular/platform-browser';

describe('ProgressBarComponent', () => {
  let fixture: ComponentFixture<ProgressBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepBasicsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ProgressBarComponent);
    fixture.componentRef.setInput('progress', 0);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('Progress change', async () => {
    const progressPar = fixture.debugElement.query(By.directive(MatProgressBar));
    const percentageContainer = fixture.debugElement.query(By.css('.progress-bar-percentage'));
    expect((progressPar.componentInstance as MatProgressBar).value).toBe(0);
    expect(percentageContainer.nativeElement.textContent).toBe('0%');

    fixture.componentRef.setInput('progress', 15);
    fixture.detectChanges();
    await fixture.whenStable();

    expect((progressPar.componentInstance as MatProgressBar).value).toBe(15);
    expect(percentageContainer.nativeElement.textContent).toBe('15%');

    fixture.componentRef.setInput('progress', 100);
    fixture.detectChanges();
    await fixture.whenStable();

    expect((progressPar.componentInstance as MatProgressBar).value).toBe(100);
    expect(percentageContainer.nativeElement.textContent).toBe('100%');
  });
});
