import { Component, input, signal } from '@angular/core';
import { StepIconsModule } from '../../step-icons.module';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { allIcons } from '../../icons';

@Component({
  selector: 'step-icon-test',
  template: `
    @if (iconName(); as name) {
      <step-icon [name]="name" />
    }
  `,
  imports: [StepIconsModule],
})
class IconTestComponent {
  readonly iconName = signal<string | undefined>(undefined);
}

describe('Icon Component', () => {
  let component: IconTestComponent;
  let fixture: ComponentFixture<IconTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconTestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(IconTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Rendering', async () => {
    let iconElement = fixture.nativeElement.querySelector('step-icon');
    expect(iconElement).toBeFalsy();

    component.iconName.set('pie-chart');
    fixture.detectChanges();

    iconElement = fixture.nativeElement.querySelector('step-icon');
    expect(iconElement).toBeTruthy();
    expect(iconElement.innerHTML).toEqual(allIcons.PieChart);

    component.iconName.set('plus-circle');
    fixture.detectChanges();

    iconElement = fixture.nativeElement.querySelector('step-icon');
    expect(iconElement).toBeTruthy();
    expect(iconElement.innerHTML).toEqual(allIcons.PlusCircle);
  });
});
