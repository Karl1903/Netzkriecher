import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimplegraphComponent } from './simplegraph.component';

describe('SimplegraphComponent', () => {
  let component: SimplegraphComponent;
  let fixture: ComponentFixture<SimplegraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SimplegraphComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SimplegraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
