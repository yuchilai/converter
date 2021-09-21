import { IColumnName } from "./columnName.model";
import {IReplaceName} from "./replaceName.model";


export interface IReplacement {
  id?: number;
  columnKey?: IColumnName[] | null;
  replaceKey?: IReplaceName[] | null;
  checked?: boolean;
}

export class Replacement implements IReplacement {
  constructor(
    public id?: number,
    public columnKey?: IColumnName[] | null,
    public replaceKey?: IReplaceName[] | null,
    public checked?: boolean
  ) {}
}
