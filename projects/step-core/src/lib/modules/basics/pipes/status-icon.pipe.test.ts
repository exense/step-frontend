import { StatusIconPipe } from './status-icon.pipe';

describe('StatusIconPipe', () => {
  it('uses the Step refresh icon for active statuses', () => {
    expect(new StatusIconPipe().transform('RUNNING')).toBe('step-refresh');
  });
});
