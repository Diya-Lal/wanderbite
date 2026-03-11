import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RestaurantsComponent } from './restaurants.component';
import { provideRouter } from '@angular/router';
import { RestaurantService } from '../../restaurant.service';
import { of } from 'rxjs';

describe('RestaurantsComponent', () => {
  let component: RestaurantsComponent;
  let fixture: ComponentFixture<RestaurantsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestaurantsComponent],
      providers: [
        provideRouter([]),
        {
          provide: RestaurantService,
          useValue: { getRestaurants: () => of([]) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RestaurantsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('getStars returns array of 5 elements', () => {
    const stars = component.getStars(3);
    expect(stars.length).toBe(5);
    expect(stars.filter((s) => s === 1).length).toBe(3);
  });
});
