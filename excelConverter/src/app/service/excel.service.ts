import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import {OUTPUT_FORMATS} from "../entities/xlsxBookType";
import {BookType} from "xlsx";
// import * as _ from 'lodash';

const EXCEL_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
let EXCEL_EXTENSION = '.csv';
// const EXCEL_EXTENSION = '.xlsx';
// const CSV_EXTENSION = '.csv';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {

  constructor() { }

  public exportAsExcelFile(
    json: any[],
    excelFileName: string,
    isNotDownload: boolean,
    indexType: number,
  ): void {
    EXCEL_EXTENSION = OUTPUT_FORMATS[indexType].ext;
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const workbook: XLSX.WorkBook = {
      Sheets: { data: worksheet },
      SheetNames: ['data'],
    };
    const excelBuffer: any = XLSX.write(workbook, {
      // bookType: 'xlsx',
      bookType: OUTPUT_FORMATS[indexType].bookType as BookType,
      type: 'array',
    });
    //const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    if (!isNotDownload) {
      ExcelService.saveAsExcelFile(excelBuffer, excelFileName);
    }
  }

  private static saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE,
    });
    FileSaver.saveAs(
      data,
      fileName +
      '_Export_' +
      new Date().getMonth() +
      '-' +
      new Date().getDate() +
      '-' +
      new Date().getFullYear() +
      '_____' +
      new Date().getTime() +
      EXCEL_EXTENSION
    );
  }
}
