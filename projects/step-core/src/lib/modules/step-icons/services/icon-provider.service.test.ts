import { IconProviderService } from './icon-provider.service';
import { TestBed } from '@angular/core/testing';
import { allIcons } from '../icons';

describe('IconProviderService', () => {
  let iconProviderService: IconProviderService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [IconProviderService],
    }).compileComponents();
    iconProviderService = TestBed.inject(IconProviderService);
  });

  it('Get icon success', () => {
    expect(iconProviderService.getIcon('pie-chart')).toBe(allIcons.PieChart);
    expect(iconProviderService.getIcon('plusCircle')).toBe(allIcons.PlusCircle);
  });

  it('Get icon failed', () => {
    const spyWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    expect(iconProviderService.getIcon('')).toBe('');
    expect(spyWarn).not.toHaveBeenCalled();

    expect(iconProviderService.getIcon('aaBBcc')).toBe('');
    expect(spyWarn).toHaveBeenCalled();
  });
});
