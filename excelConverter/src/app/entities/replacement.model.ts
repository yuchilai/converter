import { IColumnName } from "./columnName.model";
import {IReplaceName} from "./replaceName.model";
import {IRowName} from "./rowName.model";


export interface IReplacement {
  id?: string;
  name?: string;
  editName?: string;
  columnKey?: IColumnName[] | null;
  editColumnKey?: IColumnName[] | null;
  rowKey?: IRowName[] | null;
  editRowKey?: IRowName[] | null;
  replaceKey?: IReplaceName[] | null;
  editReplaceKey?: IReplaceName[] | null;
  checked?: boolean;
  isEditing?: boolean;
  isJustCreated?: boolean;
}

export class Replacement implements IReplacement {
  constructor(
    public id?: string,
    public name?: string,
    public editName?: string,
    public columnKey?: IColumnName[] | null,
    public editColumnKey?: IColumnName[] | null,
    public rowKey?: IRowName[] | null,
    public editRowKey?: IRowName[] | null,
    public replaceKey?: IReplaceName[] | null,
    public editReplaceKey?: IReplaceName[] | null,
    public checked?: boolean,
    public isEditing?: boolean,
    public isJustCreated?: boolean
  ) {}
}
