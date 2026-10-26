import { PortfolioAdminService } from './portfolio-admin.service';
import { SupabaseService } from './supabase.service';
import { DEFAULT_PORTFOLIO } from '../content';
describe('Draft concurrency protection', () => {
  let service: PortfolioAdminService;
  let query: jasmine.SpyObj<any>;
  beforeEach(() => {
    query = jasmine.createSpyObj('query', ['select', 'eq', 'update', 'single']);
    query.select.and.returnValue(query); query.eq.and.returnValue(query); query.update.and.returnValue(query);
    service = new PortfolioAdminService({ client: { from: () => query } } as unknown as SupabaseService);
  });
  async function readDraft() {
    query.single.and.resolveTo({ data: { draft_content: DEFAULT_PORTFOLIO, published_content: DEFAULT_PORTFOLIO, version: 1, updated_at: 'revision-one', published_at: null }, error: null });
    await service.getDocument();
  }
  it('conditions a save on the timestamp read by this editor', async () => {
    await readDraft();
    query.single.and.resolveTo({ data: { updated_at: 'revision-two' }, error: null });
    await service.saveDraft(DEFAULT_PORTFOLIO);
    expect(query.eq).toHaveBeenCalledWith('updated_at', 'revision-one');
    expect(service.lastSavedAt).toBe('revision-two');
  });
  it('rejects a stale update with recovery guidance', async () => {
    await readDraft();
    query.single.and.resolveTo({ data: null, error: { code: 'PGRST116' } });
    await expectAsync(service.saveDraft(DEFAULT_PORTFOLIO)).toBeRejectedWithError(/server draft changed/);
    expect(service.lastSavedAt).toBe('revision-one');
  });
  it('does not save without first reading the server draft', async () => {
    await expectAsync(service.saveDraft(DEFAULT_PORTFOLIO)).toBeRejectedWithError(/Reload the editor/);
    expect(query.update).not.toHaveBeenCalled();
  });
});
