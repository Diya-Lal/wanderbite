import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DestinationComponent } from './destination.component';

describe('DestinationComponent', () => {
  let component: DestinationComponent;
  let fixture: ComponentFixture<DestinationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DestinationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DestinationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the destinations heading', () => {
    const h1 = fixture.nativeElement.querySelector('h1');
    expect(h1.textContent).toContain('Destinations');
  });
});
