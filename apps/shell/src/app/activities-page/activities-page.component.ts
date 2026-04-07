import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import { CityStorageService } from '@org/data-access';

const ACTIVITIES_REMOTE =
  window.location.hostname === 'localhost'
    ? 'http://localhost:4204/remoteEntry.js'
    : 'https://activities-gamma.vercel.app/remoteEntry.js';

@Component({
  selector: 'app-activities-page',
  template: `<div #container class="activities-host"></div>`,
  styles: [`.activities-host { display: block; width: 100%; min-height: 100vh; }`],
  encapsulation: ViewEncapsulation.None,
})
export class ActivitiesPageComponent implements OnInit, OnDestroy {
  @ViewChild('container', { static: true }) container!: ElementRef<HTMLDivElement>;

  private cityStorage = inject(CityStorageService);
  private unmount?: () => void;

  ngOnInit(): void {
    const params = new URLSearchParams(window.location.search);
    let city = params.get('city') ?? '';
    let lat = parseFloat(params.get('lat') ?? '0');
    let lon = parseFloat(params.get('lon') ?? '0');

    // Fall back to last selected city from sessionStorage (when navigating via nav bar)
    if (!lat || !lon) {
      const c = this.cityStorage.read();
      if (c) {
        city = c.name;
        lat = c.lat;
        lon = c.lon;
      }
    }

    this.loadAndMount(city, lat, lon);
  }

  private loadAndMount(city: string, lat: number, lon: number): void {
    const win = window as any;

    const doMount = () => {
      const container = win['activities'];
      if (!container?.get) return;

      container
        .get('./mount')
        .then((factory: () => { mount: (el: HTMLElement, city: string, lat: number, lon: number) => () => void }) => {
          const mod = factory();
          this.unmount = mod.mount(this.container.nativeElement, city, lat, lon);
        })
        .catch((e: unknown) => console.error('Activities mount failed', e));
    };

    // Script already loaded
    if (win['activities']) {
      doMount();
      return;
    }

    // Load remoteEntry.js then mount
    const script = document.createElement('script');
    script.src = ACTIVITIES_REMOTE;
    script.onload = () => doMount();
    script.onerror = (e) => console.error('Failed to load activities remote', e);
    document.head.appendChild(script);
  }

  ngOnDestroy(): void {
    this.unmount?.();
  }
}
