export interface IBehavior {
  id?: number;
  fileName?: string;
  auto?: boolean;
  fileAccepted?: boolean;
  headerConvertor?: boolean;
  selectedIndex?: number;
  outputFormatsIndex?: number;
  addingMode?: boolean;
  extra?: string;
}

export class Behavior implements IBehavior {
  constructor(
    public id?: number,
    public fileName?: string,
    public auto?: boolean,
    public fileAccepted?: boolean,
    public headerConvertor?: boolean,
    public selectedIndex?: number,
    public outputFormatsIndex?: number,
    public addingMode?: boolean,
    public extra?: string
  ) {}
}
