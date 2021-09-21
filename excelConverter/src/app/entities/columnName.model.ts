export interface IColumnName {
  id?: number;
  from?: string;
  to?: string;
  checked?: boolean;
}

export class ColumnName implements IColumnName {
  constructor(
    public id?: number,
    public from?: string,
    public to?: string,
    public checked?: boolean
  ) {}
}
