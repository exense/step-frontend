import { Component, signal } from '@angular/core';
import { ArtefactInlineDetailsHeaderComponent } from '@exense/step-core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

@Component({
  selector: 'step-artefact-inline-details-header-test',
  imports: [ArtefactInlineDetailsHeaderComponent],
  template: `
    <step-artefact-inline-details-header [template]="foo" [isVisible]="isVisible()" />
    <ng-template #foo>
      <div class="testDiv">FOO</div>
    </ng-template>
  `,
})
class ArtefactInlineDetailsHeaderTestComponent {
  readonly isVisible = signal(false);
}

describe('ArtefactInlineDetailsHeader', () => {
  let fixture: ComponentFixture<ArtefactInlineDetailsHeaderTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ArtefactInlineDetailsHeaderTestComponent] }).compileComponents();

    fixture = TestBed.createComponent(ArtefactInlineDetailsHeaderTestComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('Content visibility', async () => {
    let content = fixture.debugElement.query(By.css('.testDiv'));
    expect(content).toBeNull();

    fixture.componentInstance.isVisible.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    content = fixture.debugElement.query(By.css('.testDiv'));
    expect(content).not.toBeNull();
    expect((content.nativeElement as HTMLElement).textContent).toBe('FOO');
  });
});
