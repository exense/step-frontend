import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResourceLabelComponent } from './resource-label.component';
import { AugmentedResourcesService, provideTestStepApi, Resource } from '../../../../client/step-client-module';
import { StepBasicsModule } from '../../step-basics.module';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';

describe('ResourceLabelComponent', () => {
  let fixture: ComponentFixture<ResourceLabelComponent>;
  let api: AugmentedResourcesService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepBasicsModule],
      providers: [provideTestStepApi()],
    }).compileComponents();
    fixture = TestBed.createComponent(ResourceLabelComponent);
    api = TestBed.inject(AugmentedResourcesService);
    jest.spyOn(api, 'overrideInterceptor').mockImplementation(() => api);
  });

  it('File path/name from model', async () => {
    const FILE_NAME = 'picture.png';
    const FILE_PATH = `/tmp/something/resources/${FILE_NAME}`;

    let span = fixture.debugElement.query(By.css('span'));
    expect(span).toBeFalsy();

    fixture.componentRef.setInput('stModel', FILE_PATH);
    fixture.detectChanges();
    await fixture.whenStable();

    span = fixture.debugElement.query(By.css('span'));
    expect(span.nativeElement.innerHTML).toBe(FILE_PATH);

    fixture.componentRef.setInput('stFormat', 'filename');
    fixture.detectChanges();
    await fixture.whenStable();

    span = fixture.debugElement.query(By.css('span'));
    expect(span.nativeElement.innerHTML).toBe(FILE_NAME);
  });

  it('Existed resource name', async () => {
    const resource: Resource = {
      resourceName: 'some_resource_name.txt',
    };
    const getResource = jest.spyOn(api, 'getResource').mockImplementation(() => of(resource));

    let span = fixture.debugElement.query(By.css('span'));
    expect(span).toBeFalsy();

    expect(getResource).not.toHaveBeenCalled();
    fixture.componentRef.setInput('stModel', 'resource:some_resource:123');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(getResource).toHaveBeenCalledWith('some_resource');
    span = fixture.debugElement.query(By.css('span'));
    expect(span.nativeElement.innerHTML).toBe(resource.resourceName);
  });

  it('Not existed resource', async () => {
    const getResource = jest.spyOn(api, 'getResource').mockImplementation(() => of(undefined as any as Resource));

    let span = fixture.debugElement.query(By.css('span'));
    expect(span).toBeFalsy();

    expect(getResource).not.toHaveBeenCalled();
    fixture.componentRef.setInput('stModel', 'resource:some_resource:123');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(getResource).toHaveBeenCalledWith('some_resource');
    span = fixture.debugElement.query(By.css('span'));
    expect(span.nativeElement.innerHTML).toBe(`Error: the referenced resource doesn't exist anymore.`);
  });
});
