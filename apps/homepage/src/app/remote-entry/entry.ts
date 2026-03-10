import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

/**
 * Remote entry component — bootstrapped when the homepage remote runs standalone.
 * When loaded by the shell, the MFE routes in entry.routes.ts are used instead.
 */
@Component({
  imports: [RouterModule],
  selector: 'app-homepage-entry',
  template: `<router-outlet></router-outlet>`,
})
export class RemoteEntry {}
