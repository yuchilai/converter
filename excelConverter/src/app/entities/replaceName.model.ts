export interface IReplaceName {
  id?: string;
  columnName?: string;
  editColumnName?: string;
  from?: string;
  to?: string;
  editFrom?: string;
  editTo?: string;
  checked?: boolean;
  isEditing?: boolean;
  isJustCreated?: boolean;
}

export class ReplaceName implements IReplaceName {
  constructor(
    public id?: string,
    public columnName?: string,
    public editColumnName?: string,
    public from ?: string,
    public to ?: string,
    public editFrom?: string,
    public editTo?: string,
    public checked?: boolean,
    public isEditing?: boolean,
    public isJustCreated?: boolean
  ) {}
} {}
