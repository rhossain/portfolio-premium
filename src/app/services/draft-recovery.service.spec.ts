import { DraftRecoveryService } from './draft-recovery.service';
import { DEFAULT_PORTFOLIO } from '../content';
describe('Draft recovery', () => {
  const recovery = new DraftRecoveryService();
  afterEach(() => recovery.clear());
  it('restores content and server timestamp without storing a session', () => {
    expect(recovery.write(DEFAULT_PORTFOLIO, 'server-revision')).toBeTrue();
    const saved = recovery.read()!;
    expect(saved.content.profile.name).toBe(DEFAULT_PORTFOLIO.profile.name);
    expect(saved.baseUpdatedAt).toBe('server-revision');
    expect(Object.keys(saved).sort()).toEqual(['baseUpdatedAt', 'content', 'savedAt']);
  });
  it('discards malformed and expired recovery copies', () => {
    sessionStorage.setItem('portfolio-draft-recovery-v1', 'invalid');
    expect(recovery.read()).toBeNull();
    recovery.write(DEFAULT_PORTFOLIO, 'old');
    const saved = recovery.read()!;
    sessionStorage.setItem('portfolio-draft-recovery-v1', JSON.stringify({ ...saved, savedAt: Date.now() - 86400001 }));
    expect(recovery.read()).toBeNull();
  });
  it('reports unavailable browser storage instead of claiming recovery is safe', () => {
    spyOn(Storage.prototype, 'setItem').and.throwError('Unavailable');
    expect(recovery.write(DEFAULT_PORTFOLIO, '')).toBeFalse();
  });
});
