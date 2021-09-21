export interface IReplaceName {
  id?: number;
  columnName?: string;
  from?: string;
  to?: string;
  checked?: boolean
}

export class ReplaceName implements IReplaceName {
  constructor(
    public id?: number,
    public columnName?: string,
    public from ?: string,
    public to ?: string,
    public checked?: boolean
  ) {}
} {}
