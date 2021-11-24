import {Component, Input, OnInit} from '@angular/core';
import {ColumnName, IColumnName} from "../../entities/columnName.model";
import {IRowName, RowName} from "../../entities/rowName.model";
import {IReplaceName, ReplaceName} from "../../entities/replaceName.model";
import {DecimalPlace, IDecimalPlaces} from "../../entities/decimalPlaces.model";

@Component({
  selector: 'app-search-dropdown',
  templateUrl: './search-dropdown.component.html',
  styleUrls: ['./search-dropdown.component.css']
})
export class SearchDropdownComponent implements OnInit {
  @Input() item: IColumnName | IRowName | IReplaceName = {};

  constructor() {}

  ngOnInit(): void {
  }

  setSearchResult(str: string): void{
    this.item.editFrom = str
    this.item.searchResult = undefined;
  }
}
