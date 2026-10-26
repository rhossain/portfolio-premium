import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ConfirmationComponent } from './shared/confirmation.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ConfirmationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<router-outlet /><app-confirmation />`,
})
export class AppComponent {}
