export interface IColumnName {
  id?: string;
  from?: string;
  to?: string;
  editFrom?: string;
  editTo?: string;
  searchResult?: string[];
  searchResultForTo?: string[];
  checked?: boolean;
  isEditing?: boolean;
  isJustCreated?: boolean;
}

export class ColumnName implements IColumnName {
  constructor(
    public id?: string,
    public from?: string,
    public to?: string,
    public editFrom?: string,
    public editTo?: string,
    public searchResult?: string[],
    public searchResultForTo?: string[],
    public checked?: boolean,
    public isEditing?: boolean,
    public isJustCreated?: boolean
  ) {}
}
