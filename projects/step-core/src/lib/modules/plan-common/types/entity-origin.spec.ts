import { isAiGeneratedEntity } from './entity-origin';

describe('isAiGeneratedEntity', () => {
  it('recognizes an entity whose metadata marks it as generated, whatever the case of the marker', () => {
    expect(isAiGeneratedEntity({ metadata: { origin: 'ai' } })).toBe(true);
    expect(isAiGeneratedEntity({ metadata: { origin: 'AI' } })).toBe(true);
  });

  it('ignores entities carrying another origin, other metadata or none at all', () => {
    expect(isAiGeneratedEntity({ metadata: { origin: 'import', owner: 'team-a' } })).toBe(false);
    expect(isAiGeneratedEntity({ metadata: { owner: 'team-a' } })).toBe(false);
    expect(isAiGeneratedEntity({ metadata: {} })).toBe(false);
    expect(isAiGeneratedEntity({})).toBe(false);
    expect(isAiGeneratedEntity()).toBe(false);
  });
});
