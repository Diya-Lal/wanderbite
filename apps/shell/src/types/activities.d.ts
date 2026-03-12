declare module 'activities/mount' {
  export function mount(
    el: HTMLElement,
    city: string,
    lat: number,
    lon: number
  ): () => void;
}
