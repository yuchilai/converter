import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchDropdownColumnNameComponent } from './search-dropdown-column-name.component';

describe('SearchDropdownColumnNameComponent', () => {
  let component: SearchDropdownColumnNameComponent;
  let fixture: ComponentFixture<SearchDropdownColumnNameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchDropdownColumnNameComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchDropdownColumnNameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
