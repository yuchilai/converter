export interface IDecimalPlaces {
  id?: string;
  columnName?: string;
  editColumnName?: string;
  decimalPlacesOption?: string;
  editDecimalPlacesOption?: string;
  decimalPlacesOptionList?: string[];
  calcDecimalPlaceDigit?: number;
  mathMethod?: string;
  editMathMethod?: string;
  mathMethodList?: string[];
  checked?: boolean;
  isEditing?: boolean;
  isJustCreated?: boolean;
}

export class DecimalPlace implements IDecimalPlaces {
  constructor(
    public id?: string,
    public columnName?: string,
    public editColumnName?: string,
    public decimalPlacesOption?: string,
    public editDecimalPlacesOption?: string,
    public decimalPlacesOptionList?: string[],
    public calcDecimalPlaceDigit?: number,
    public mathMethod?: string,
    public editMathMethod?: string,
    public mathMethodList?: string[],
    public checked?: boolean,
    public isEditing?: boolean,
    public isJustCreated?: boolean,
  ) {}
} {}
