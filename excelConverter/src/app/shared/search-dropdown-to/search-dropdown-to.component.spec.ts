import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchDropdownToComponent } from './search-dropdown-to.component';

describe('SearchDropdownToComponent', () => {
  let component: SearchDropdownToComponent;
  let fixture: ComponentFixture<SearchDropdownToComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchDropdownToComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchDropdownToComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
