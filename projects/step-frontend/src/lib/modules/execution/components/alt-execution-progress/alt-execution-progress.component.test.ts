import { isExecutionCompletionTransition } from '../../shared/execution-refresh.utils';

describe('isExecutionCompletionTransition', () => {
  it('returns true when an execution changes from active to ended', () => {
    expect(isExecutionCompletionTransition({ status: 'RUNNING' }, { status: 'ENDED' })).toBe(true);
  });

  it('returns false when the execution has not ended', () => {
    expect(isExecutionCompletionTransition({ status: 'RUNNING' }, { status: 'RUNNING' })).toBe(false);
  });

  it('returns false when an ended execution is refreshed again', () => {
    expect(isExecutionCompletionTransition({ status: 'ENDED' }, { status: 'ENDED' })).toBe(false);
  });
});
