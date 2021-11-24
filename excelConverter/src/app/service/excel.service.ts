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
let NULL_MSG = '(!@#NULL#@!)';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {

  constructor() { }

  public exportAsCustomFileFromJson(
    json: any[],
    orderedHeaders: string[],
    excelFileName: string,
    isNotDownload: boolean,
    indexType: number,
  ): void {
    EXCEL_EXTENSION = OUTPUT_FORMATS[indexType].ext;
    let worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    // this.removeCertainCells(NULL_MSG, worksheet);
    worksheet = this.arrangeSort(orderedHeaders, worksheet);
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

  public exportAsCustomFileFromWorksheet(
    worksheet: XLSX.WorkSheet,
    orderedHeaders: string[],
    excelFileName: string,
    isNotDownload: boolean,
    indexType: number,
  ): void {
    EXCEL_EXTENSION = OUTPUT_FORMATS[indexType].ext;
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

  public exportAsCustomFileFromWorkbook(
    workbook: XLSX.WorkBook,
    orderedHeaders: string[],
    excelFileName: string,
    isNotDownload: boolean,
    indexType: number,
  ): void {
    EXCEL_EXTENSION = OUTPUT_FORMATS[indexType].ext;
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

  public removeCertainCells(removeStr: string, worksheet: XLSX.WorkSheet): XLSX.WorkSheet{
    const range = XLSX.utils.decode_range(<string>worksheet["!ref"]);
    for(let R = range.s.r; R <= range.e.r; ++R) {
      for(let C = range.s.c; C <= range.e.c; ++C) {
        let cell_address = {c:C, r:R};
        /* if an A1-style address is needed, encode the address */
        let cell_ref = XLSX.utils.encode_cell(cell_address);
        if(worksheet[ExcelService.ec(C,R)].v === removeStr){
          worksheet[ExcelService.ec(C,R)].v = undefined;
        }
      }
    }
    return worksheet;
  }

  public arrangeSort(orderedHeaders: string[], ws: XLSX.WorkSheet): XLSX.WorkSheet{
    const _2DArray: string[][] = XLSX.utils.sheet_to_json(ws, {header:1, raw:false});
    const _sortedList: string[][] = [];
    const sortedBoundary = orderedHeaders.length;
    const unorderedHeaders = _2DArray[0];
    _sortedList.push(ExcelService.mergeTwoHeaders(orderedHeaders, unorderedHeaders));
    for (let i = 1; i < _2DArray.length; i++) {
      // start with 1 to skip first which is the header
      const list: string[] = [];
      orderedHeaders.forEach((key: string) => {
        const swapIndex = ExcelService.getHeaderIndexByStr(key, unorderedHeaders);
        if(swapIndex >= 0 && swapIndex < _2DArray[i].length){
          list.push(_2DArray[i][swapIndex] !== undefined ? _2DArray[i][swapIndex] : '');
        }
        else{
          list.push('');
        }
        for (let j = sortedBoundary; j < _2DArray[i].length; j++) {
          list.push(_2DArray[i][j] !== undefined ? _2DArray[i][j] : '');
        }
      });
      _sortedList.push(list);
    }
    return XLSX.utils.json_to_sheet(_sortedList, { skipHeader: true });
  }

  private static ec(C: number, R: number) {
    return XLSX.utils.encode_cell({c:C, r:R});
  }

  private static getHeaderIndexByStr(str: string, list: string[]): number {
    // if there is the same header, it will return last index;
    let i = -1;
    list.forEach((s: string, index: number) => {
      if(s === str){
        i = index;
      }
    })
    return i;
  }

  private static mergeTwoHeaders(orderedHeaders: string[], unorderedHeaders: string[]): string[] {
    let headers: string[] = JSON.parse(JSON.stringify(orderedHeaders));
    if(orderedHeaders.length < unorderedHeaders.length){
      for (let i = orderedHeaders.length; i < unorderedHeaders.length; i++) {
        if(headers === undefined){
          headers = [];
        }
        headers.push(unorderedHeaders[i]);
      }
    }
    return headers;
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
