import {Component, Input, OnInit} from '@angular/core';
import {IReplaceName} from "../../entities/replaceName.model";
import {IDecimalPlaces} from "../../entities/decimalPlaces.model";

@Component({
  selector: 'app-search-dropdown-column-name',
  templateUrl: './search-dropdown-column-name.component.html',
  styleUrls: ['./search-dropdown-column-name.component.css']
})
export class SearchDropdownColumnNameComponent implements OnInit {
  @Input() item: IReplaceName | IDecimalPlaces = {};

  constructor() { }

  ngOnInit(): void {
  }

  setSearchResult(str: string): void{
    this.item.editColumnName = str
    this.item.searchResultForColumnName = undefined;
  }
}
