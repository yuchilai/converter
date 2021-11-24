import {Component, Input, OnInit} from '@angular/core';
import {IColumnName} from "../../entities/columnName.model";
import {IRowName} from "../../entities/rowName.model";
import {IReplaceName} from "../../entities/replaceName.model";

@Component({
  selector: 'app-search-dropdown-to',
  templateUrl: './search-dropdown-to.component.html',
  styleUrls: ['./search-dropdown-to.component.css']
})
export class SearchDropdownToComponent implements OnInit {
  @Input() item: IColumnName | IRowName | IReplaceName = {};

  constructor() { }

  ngOnInit(): void {
  }

  setSearchResult(str: string): void{
    this.item.editTo = str
    this.item.searchResultForTo = undefined;
  }
}
