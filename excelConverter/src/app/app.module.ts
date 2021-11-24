import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { DragDropModule } from "@angular/cdk/drag-drop";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ExcelService } from './service/excel.service';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import {MatSelectModule} from "@angular/material/select";
import { SearchDropdownComponent } from './shared/search-dropdown/search-dropdown.component';
import { SearchDropdownToComponent } from './shared/search-dropdown-to/search-dropdown-to.component';
import { SearchDropdownColumnNameComponent } from './shared/search-dropdown-column-name/search-dropdown-column-name.component';


@NgModule({
  declarations: [
    AppComponent,
    SearchDropdownComponent,
    SearchDropdownToComponent,
    SearchDropdownColumnNameComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    DragDropModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    NgxMatSelectSearchModule,
    MatSelectModule
  ],
  providers: [ExcelService],
  bootstrap: [AppComponent]
})
export class AppModule { }
