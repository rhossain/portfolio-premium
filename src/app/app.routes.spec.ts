import { ActivatedRouteSnapshot, CanDeactivateFn, RouterStateSnapshot } from '@angular/router';
import { AdminContentComponent } from './admin/admin-content.component';
import { routes } from './app.routes';

describe('Editor navigation protection', () => {
  const guard = routes.find(route => route.path === 'admin')!.children!.find(route => route.path === 'content/:section')!.canDeactivate![0] as CanDeactivateFn<AdminContentComponent>;
  let editor: jasmine.SpyObj<AdminContentComponent>;
  beforeEach(() => {
    editor = jasmine.createSpyObj('editor', ['busy', 'canLeave']);
    editor.busy.and.returnValue(false);
    editor.canLeave.and.resolveTo(false);
  });
  function navigate(url: string) {
    return guard(editor, {} as ActivatedRouteSnapshot, { url: '/admin/content/settings' } as RouterStateSnapshot, { url } as RouterStateSnapshot);
  }
  it('retains the editor draft when switching valid sections, including query strings', () => {
    expect(navigate('/admin/content/profile')).toBeTrue();
    expect(navigate('/admin/content/projects?selected=1')).toBeTrue();
    expect(editor.canLeave).not.toHaveBeenCalled();
  });
  it('still checks unsaved edits before leaving the editor', async () => {
    expect(await navigate('/admin')).toBeFalse();
    expect(await navigate('/')).toBeFalse();
    expect(editor.canLeave).toHaveBeenCalledTimes(2);
  });
  it('does not treat invalid section paths as safe section changes', async () => {
    expect(await navigate('/admin/content/profile-other')).toBeFalse();
    expect(await navigate('/admin/content/unknown')).toBeFalse();
    expect(editor.canLeave).toHaveBeenCalledTimes(2);
  });
  it('blocks section changes through the existing guard while a mutation is pending', async () => {
    editor.busy.and.returnValue(true);
    expect(await navigate('/admin/content/profile')).toBeFalse();
    expect(editor.canLeave).toHaveBeenCalled();
  });
});
