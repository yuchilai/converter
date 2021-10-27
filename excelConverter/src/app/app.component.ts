import {Component, ElementRef, HostListener, OnInit, QueryList, ViewChild, ViewChildren,} from '@angular/core';
import {ExcelService} from './service/excel.service';
import * as XLSX from 'xlsx';
import {WorkSheet} from 'xlsx';
import {Invoice} from './invoice.model';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {ErrorMsg, IErrorMsg} from './errorMsg.model';
import {Displayed, IDisplayed} from './displayed.model';
import Swal from 'sweetalert2';
import {Behavior, IBehavior} from './behavior.model';
import {IReplacement, Replacement} from "./entities/replacement.model";
import {ColumnName, IColumnName} from "./entities/columnName.model";
import {IReplaceName, ReplaceName} from "./entities/replaceName.model";
import * as uuid from 'uuid';
import {IRowName, RowName} from "./entities/rowName.model";
import {OUTPUT_FORMATS} from "./entities/xlsxBookType";
import {DecimalPlace, IDecimalPlaces} from "./entities/decimalPlaces.model";
import {collapse, fade, leftRotate, rightRotate} from "./util/animation";
import {DeviceDetectorService} from 'ngx-device-detector';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
    fade,
    collapse,
    rightRotate,
    leftRotate
  ]
})
export class AppComponent implements OnInit {
  @ViewChild('myInput')
  myInputVariable?: ElementRef;

  @ViewChild('editArea')
  editArea?: ElementRef;

  @ViewChild('advanceArea')
  advanceArea?: ElementRef;

  @ViewChild('uploadArea')
  uploadArea?: ElementRef;

  @ViewChild('topOne')
  topOne?: ElementRef;

  @ViewChild('editLayoutList')
  editLayoutList?: ElementRef;

  @ViewChild('advanceThreeChoices')
  advanceThreeChoices?: ElementRef;

  @ViewChild('advanceATitle')
  advanceATitle?: ElementRef;

  @ViewChild('advanceBTitle')
  advanceBTitle?: ElementRef;

  @ViewChild('advanceCTitle')
  advanceCTitle?: ElementRef;

  @ViewChild('advanceDTitle')
  advanceDTitle?: ElementRef;

  @ViewChildren('layoutList') layoutList?: QueryList<ElementRef>;

  @ViewChildren('columnKeyCells') columnKeyCells?: QueryList<ElementRef>;

  @ViewChildren('replaceKeyCells') replaceKeyCells?: QueryList<ElementRef>;

  @ViewChildren('replaceAllCells') replaceAllCells?: QueryList<ElementRef>;

  @ViewChildren('decimalPlaceCells') decimalPlaceCells?: QueryList<ElementRef>;

  name = 'Certify to Sage Intacct AP Converter';
  willDownload = false;
  invoiceKeyList: string[] = [];
  invoices: any[] = [];
  errorMsg: IErrorMsg[] = [];
  fileName?: string;
  isEdit = false;
  acceptExcelOnly =
    '.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel';
  isExcelOnly = true;
  excelStyle = '  color: #141a46; background-color: #ec8b5e;';
  notExcelStyle = '  color: #ec8b5e; background-color: #141a46;';
  exportFileName = 'AP_Invoices';
  isEditExportFileName = false;
  isAdding = false;
  isSportMode = true;
  inputToBeAdded?: string;
  tempName?: string;
  isAutoDownload = true;
  hasOutput = false;
  outputList: any[] = [];
  displayedList: any[] = [];
  isShowDownloadBtn = false;
  allFiledNameList: Array<string[]> = [];
  storageName = 'gccnyc_ap_field_name';
  storageIndex = 'gccnyc_ap_selected_index';
  storageCB = 'gccnyc_ap_customer_behavior';
  storageListNames = 'gccnyc_ap_list_name';
  storageReplaceName = 'gccnyc_ap_replacement';
  editingIndex?: number;
  isChanged?: boolean;
  isCreatingBtnAppeared = false;
  selectedIndex?: number;
  selectedKeyList?: string[];
  displayedDefaultKeyList?: string[];
  isEditingLayout = false;
  behavior?: IBehavior;
  date?: Date;
  listNames: string[] = [];
  listName?: string;
  defaultName = 'Default Layout';
  replacements?: IReplacement[];
  displayReplacement?: IReplacement;
  isAdvance = false;
  isUsingAdvance = false;
  isColumnHeaderChanged = false;
  sameHeader = '(!@#SAME#@!)';
  isImportEmpty = false;
  nullMsg = '(!@#NULL#@!)';
  flexDirectionColumnStyle = 'flex-direction: column;';
  cursorAutoStyle = 'cursor: auto;';
  cellBorderHoverColor = 'color: #86868b;';
  editingCellStyle = 'cursor: auto; border-color: #86868b;';
  radioLeftNullBtnStyle = 'width: 62px; border-radius: 0rem; border-right: 0px;';
  radioMidNullBtnStyle = 'display: flex; justify-content: center; align-items: center; border-radius: 0rem; border-color: #ffc107; border-right: 0px; border-left: 0px;';
  radioRightNullBtnStyle = 'width: 62px; border-radius: 0rem; border-left: 0px;';
  convertTypeList?: any;
  outputTypeIndex = 9;
  orderList: string[] = [];
  exchangeArrowBtnOfOrderList: string[] = [];
  defaultPlaceValue = 5;
  floor = 'Floor';
  round = 'Round';
  ceil = 'Ceil';
  defaultMathMethodOptions = [this.floor, this.round, this.ceil];
  prefix = 'x.';
  height?: number;
  nullForApplied = '(NULL)';
  screenWidth?: number;
  mobileWidth = 540;
  tabletsWidth = 780;
  isMobile?: boolean;
  preIsMobile?: boolean;
  isTablet?: boolean;
  isDesktopDevice?: boolean;
  deviceInfo?: any;
  columnKeyCollapsed = false;
  replaceKeyCollapsed = false;
  replaceAllCollapsed = false;
  decimalPlaceCollapsed = false;
  mobileBorderTop = 'border-top: solid 1px rgba(0, 0, 0, 0.17);';
  mobileExpandStyle = 'border-top: solid 1px rgba(0, 0, 0, 0.17); padding: 20px;';
  resizeC = 1;

  Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    },
  });

  ToastTop = Swal.mixin({
    toast: true,
    position: 'top',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    },
  });

  constructor(
    private excelService: ExcelService,
    private deviceService: DeviceDetectorService
  ) {
    // this.epicFunction();
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.cancelEditing();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    if (window.innerWidth != this.screenWidth) {

      // Update the window width for next time
      this.screenWidth = window.innerWidth;
      if(this.screenWidth !== undefined){
        console.warn(this.screenWidth)
        this.detectMobileScreen(this.screenWidth);
      }
    }

  }

  ngOnInit() {
    this.convertTypeList = OUTPUT_FORMATS;
    // this.preIsMobile = this.deviceService.isMobile() || this.deviceService.isTablet();
    this.screenWidth = window.innerWidth;
    if(this.screenWidth !== undefined){
      this.detectMobileScreen(this.screenWidth);
    }
    this.replacements = [];
    const tempReplacements = localStorage.getItem(this.storageReplaceName);
    if(tempReplacements !== null){
      this.replacements = JSON.parse(tempReplacements);
      if(this.replacements !== undefined && this.replacements.length > 0){
        this.resetIsEditing(this.replacements);
      }

    }
    // for (let i = 0; i < 10; i++) {
    //   const r: IReplacement = new Replacement();
    //   r.id = uuid.v4();
    //   r.name = 'Account ' + i;
    //   const c: IColumnName = new ColumnName();
    //   c.id = uuid.v4();
    //   c.from = 'MyColumn ' + i;
    //   c.to = 'MyMonColumn ' + i;
    //   const c1: IColumnName = new ColumnName();
    //   c1.id = uuid.v4();
    //   c1.from = 'MyColumn ' + uuid.v1();
    //   c1.to = 'MyMonColumn ' + uuid.v1();
    //   const rName: IReplaceName = new ReplaceName();
    //   rName.id = uuid.v4();
    //   rName.from = 'replace ' + i;
    //   rName.to = 'replaceTo ' + i;
    //   if(r.columnKey === undefined){
    //     r.columnKey = [];
    //   }
    //   if(r.replaceKey === undefined){
    //     r.replaceKey = [];
    //   }
    //   r.columnKey?.push(c);
    //   r.columnKey?.push(c1);
    //   r.replaceKey?.push(rName);
    //   this.replacements.push(r);
    // }



    this.date = new Date();
    const foo = localStorage.getItem(this.storageListNames);
    if(foo !== null){
      this.listNames = JSON.parse(foo);
    }
    const tempList = localStorage.getItem(this.storageName);
    //list in the localStorage
    if (
      tempList !== null &&
      JSON.parse(tempList)?.length > 0
    ) {
      const filedNameListFromStorage: Array<string[]> = JSON.parse(
        tempList
      );
      console.warn(filedNameListFromStorage)
      filedNameListFromStorage.forEach((strList) => {
        this.allFiledNameList.push(strList);
      });
      console.warn(this.allFiledNameList)
      if (localStorage.getItem(this.storageIndex) !== null) {
        const index = Number(localStorage.getItem(this.storageIndex));
        if (
          !isNaN(index) &&
          index > -1 &&
          index < this.allFiledNameList?.length
        ) {
          this.selectedIndex = index;
          this.selectedKeyList = this.allFiledNameList[this.selectedIndex];
          this.invoiceKeyList = this.selectedKeyList;
        } else {
          this.selectedIndex = 0;
          this.selectedKeyList = this.allFiledNameList[this.selectedIndex];
          this.invoiceKeyList = this.selectedKeyList;
          localStorage.setItem(this.storageIndex, String(this.selectedIndex));
        }
      }
      else{
        this.selectedIndex = 0;
        this.selectedKeyList = this.allFiledNameList[this.selectedIndex];
        this.invoiceKeyList = this.selectedKeyList;
        localStorage.setItem(this.storageIndex, String(this.selectedIndex));
      }
    } else {
      this.createADefaultKeyObjGlobally();
      //has list in the localStorage, but is empty [];
      if (tempList !== null && JSON.parse(tempList)?.length === 0) {
        localStorage.setItem(
          this.storageName,
          JSON.stringify(this.allFiledNameList)
        );
        this.selectedIndex = 0;
        localStorage.setItem(this.storageIndex, String(this.selectedIndex));
      } else {
        //nothing in localStorage... this.storageName(layoutKey)
        this.selectedIndex = 0;
        this.selectedKeyList = this.invoiceKeyList;
      }
    }

    const tempCB = localStorage.getItem(this.storageCB);
    if (tempCB !== null) {
      this.behavior = JSON.parse(tempCB);
      if (
        this.behavior?.fileName !== undefined &&
        this.behavior?.fileName !== ''
      ) {
        this.exportFileName = this.behavior.fileName;
        this.tempName = this.behavior.fileName;
      }
      if (this.behavior?.auto !== undefined) {
        this.isAutoDownload = this.behavior.auto;
      }
      if (this.behavior?.fileAccepted !== undefined) {
        this.isExcelOnly = this.behavior.fileAccepted;
      }
      if (this.behavior?.addingMode !== undefined) {
        this.isSportMode = this.behavior.addingMode;
      }
    }
  }

  epicFunction(): void {
    console.log('hello `Home` component');
    this.deviceInfo = this.deviceService.getDeviceInfo();
    this.isMobile = this.deviceService.isMobile(); // returns if the device is a mobile device (android / iPhone / windows-phone etc)
    this.isTablet = this.deviceService.isTablet(); // returns if the device us a tablet (iPad etc)
    this.isDesktopDevice = this.deviceService.isDesktop(); // returns if the app is running on a Desktop browser.
    if(this.isTablet){
      this.isMobile = true;
    }
    this.columnKeyCollapsed = this.isMobile;
    this.replaceKeyCollapsed = this.isMobile;
    this.replaceAllCollapsed = this.isMobile;
    this.decimalPlaceCollapsed = this.isMobile;
    console.log(this.isMobile);
    console.log(this.isTablet);
    console.log(this.isDesktopDevice);
  }

  onFileChange(ev: any) {
    if(this.selectedIndex !== undefined && this.selectedIndex > -1 && this.selectedIndex < this.allFiledNameList.length){
      this.invoiceKeyList = this.allFiledNameList[this.selectedIndex];
      let workBook: any = null;
      let jsonData = null;
      const reader = new FileReader();
      const file = ev.target.files[0];
      this.fileName = ev.target.files[0].name;
      reader.onload = (event) => {
        const data = reader.result;
        workBook = XLSX.read(data, { type: 'binary' });
        jsonData = workBook.SheetNames.reduce((initial: any, name: any) => {
          const sheet = workBook.Sheets[name];
          initial[name] = XLSX.utils.sheet_to_json(sheet, {defval:"", raw:false});
          return initial;
        }, {});
        const dataString = JSON.stringify(jsonData);

        const jsonArr = JSON.parse(dataString);
        this.outputList = [];
        this.displayedList = [];
        this.errorMsg = [];
        if (workBook.SheetNames.length !== undefined) {
          for (let i = 0; i < workBook.SheetNames.length; i++) {
            this.invoices = [];
            if(this.isColumnHeaderChanged){
              var Heading = [
                this.invoiceKeyList,
              ];
              if(this.checkIfHasSame(this.invoiceKeyList)){
                const work_sheet_headers = this.getHeadersFromWorkSheet(workBook.Sheets[workBook.SheetNames[i]]);
                if(work_sheet_headers.length > 0){
                  Heading = [
                    this.mergeTwoHeaders(Object.assign([], this.invoiceKeyList), work_sheet_headers)
                  ];
                }
              }


              // //Had to create a new workbook and then add the header
              // const ws = XLSX.utils.book_new();
              // const jj = XLSX.utils.sheet_add_aoa(XLSX.utils.json_to_sheet(jsonArr[workBook.SheetNames[i]]), Heading, {cellDates: true});
              const ws = XLSX.utils.sheet_add_aoa(workBook.Sheets[workBook.SheetNames[i]], Heading, {cellDates: true, sheetStubs: true});
              // const jsonObj = XLSX.utils.sheet_to_json(wsHeaders, {defval:""});
              // const jsonObj = XLSX.utils.sheet_to_json(wsHeaders, {defval:""});
              this.invoices = XLSX.utils.sheet_to_json(ws, {defval: "", raw: false});
              console.warn(this.invoices.length)
              this.isImportEmpty = this.invoices.length === 0;
              // this.invoices.push(JSON.parse(JSON.stringify(jsonObj)));
              //
              // //Starting in the second row to avoid overriding and skipping headers
              // const workSheet = XLSX.utils.sheet_add_json(ws, jsonArr[workBook.SheetNames[i]], { origin: 'A2', skipHeader: true });
              // const j = XLSX.utils.sheet_to_json(workSheet);
              // // console.warn(j)
              // this.excelService.exportAsExcelFile(
              //   jsonObj,
              //   this.exportFileName,
              //   !this.isAutoDownload
              // );

              // jsonArr[workBook.SheetNames[i]].forEach((obj: any) => {
              //   const invoiceObj = this.invoiceKeyList.reduce((carry:any, item: any) => {
              //     carry[item] = undefined;
              //     return carry;
              //   }, {});
              //   // console.warn(invoiceObj)
              //   let isObjNotEmpty = false;
              //   const tempListValue = [];
              //   console.warn(Object.keys(obj))
              //   for (var k in obj) {
              //     // console.warn(k)
              //     tempListValue.push(obj[k]);
              //   }
              //   console.warn(tempListValue)
              //   let index = 0;
              //   for(var key in invoiceObj){
              //     if(invoiceObj.hasOwnProperty(key)){
              //       invoiceObj[key] = tempListValue[index++];
              //     }
              //   }
              //   this.invoices.push(invoiceObj);
              // });
            }
            else{
              jsonArr[workBook.SheetNames[i]].forEach((obj: any) => {
                let invoiceObj = this.invoiceKeyList.reduce((carry:any, item: any) => {
                  carry[item] = undefined;
                  return carry;
                }, {});
                // console.warn(invoiceObj)
                let isObjNotEmpty = false;
                for (var key in obj) {
                  this.invoiceKeyList.forEach((k) => {
                    // console.log("key: " + key + ", value: " + obj[key])
                    // console.log("k: " + k + ", value: " + invoiceObj[k]);
                    // console.log(key === k);
                    if (key === k) {
                      if (obj.hasOwnProperty(key) && obj[key] !== undefined) {
                        invoiceObj[k] = obj[key];
                        isObjNotEmpty = true;
                      }
                    }
                  });
                  // console.log("key: " + key + ", value: " + obj[key])
                }
                // console.log(isObjNotEmpty)
                for (const option of this.orderList) {
                  invoiceObj = this.advanceReplace(invoiceObj, option);
                }
                if (isObjNotEmpty) {
                  this.invoices.push(invoiceObj);
                }
              });
              this.countLineNO();
            }
            if (this.invoices.length > 0) {
              if(this.behavior?.outputFormatsIndex !== undefined){
                this.outputTypeIndex = this.behavior.outputFormatsIndex;
              }
              this.excelService.exportAsExcelFile(
                this.invoices,
                this.exportFileName,
                !this.isAutoDownload,
                this.outputTypeIndex
              );
              this.outputList.push(this.invoices);
              if (this.isAutoDownload) {
                if (this.checkIfOutputListNotEmpty()) {
                  this.hasOutput = false;
                  this.isShowDownloadBtn = true;
                }
              } else {
                if (this.checkIfOutputListNotEmpty()) {
                  this.hasOutput = true;
                }
              }
              const itemObj: IDisplayed = new Displayed();
              itemObj.name = workBook.SheetNames[i];
              if (itemObj.displayList === undefined) {
                itemObj.displayList = [];
              }
              itemObj.displayList.push(this.invoices);
              this.displayedList.push(itemObj);
            } else {
              const msgObj = new ErrorMsg();
              if(this.isImportEmpty){
                msgObj.msg = 'Cannot accept excel (work sheet) is empty OR only row 1 has the data! TIP: If you want to add headers with empty work sheet, you can add any thing below row 1. Thus, this will add any headers you types.'
              }
              else{
                msgObj.msg =
                  'Sheet name: ' +
                  workBook.SheetNames[i] +
                  ' does not match any field names that are shown in the button of the list (File: ' +
                  this.fileName +
                  ')';
              }
              msgObj.isDisplayed = true;
              this.errorMsg.push(msgObj);
              this.checkIfOutputListNotEmpty();

              this.ToastTop.fire({
                icon: 'error',
                title: 'Something went wrong! Please see the detail above!',
              });
            }
          }
        } else {
          this.ToastTop.fire({
            icon: 'error',
            title: 'Something went wrong! Please, refresh it again!',
          });
        }
        this.resetFile();
      };
      reader.readAsBinaryString(file);
    }
    else{
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please select your layout!',
        footer: '<a href="/">Can not fix the problems? Click here to refresh</a>'
      })
    }
  }

  // renameKeys(obj, newKeys) {
  //   const keyValues = Object.keys(obj).map(key => {
  //     const newKey = newKeys[key] || key;
  //     return { [newKey]: obj[key] };
  //   });
  //   return Object.assign({}, ...keyValues);
  // }

  checkIfOutputListNotEmpty(): boolean {
    return this.outputList.length > 0;
  }

  countLineNO(): void {
    for (let i = 0; i < this.invoices.length; i++) {
      const item = this.invoices[i];
      let counting = 1;
      for (let j = i - 1; j >= 0; j--) {
        const compareObj = this.invoices[j];
        if (item.BILL_NO === compareObj.BILL_NO) {
          counting++;
        }
      }
      item.LINE_NO = String(counting);
    }
  }

  // setDownload(data: any) {
  //   this.willDownload = true;
  //   setTimeout(() => {
  //     const el = document.querySelector('#download');
  //     el.setAttribute(
  //       'href',
  //       `data:text/json;charset=utf-8,${encodeURIComponent(data)}`
  //     );
  //     el.setAttribute('download', 'xlsxtojson.json');
  //   }, 1000);
  // }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(
      this.invoiceKeyList,
      event.previousIndex,
      event.currentIndex
    );
    this.isChanged = true;
  }

  dropOrder(event: CdkDragDrop<string[]>) {
    moveItemInArray(
      this.orderList,
      event.previousIndex,
      event.currentIndex
    );
  }

  dropColumnKeyOrder(event: CdkDragDrop<string[]>) {
    if(this.displayReplacement && this.displayReplacement.columnKey){
      moveItemInArray(
        this.displayReplacement.columnKey,
        event.previousIndex,
        event.currentIndex
      );
      this.saveReplacementInLocalStorage(true);
    }
    console.warn(this.displayReplacement?.columnKey)
  }

  dropReplaceKeyOrder(event: CdkDragDrop<string[]>) {
    if(this.displayReplacement && this.displayReplacement.replaceKey){
      moveItemInArray(
        this.displayReplacement.replaceKey,
        event.previousIndex,
        event.currentIndex
      );
      this.saveReplacementInLocalStorage(true);
    }
  }

  dropReplaceAllOrder(event: CdkDragDrop<string[]>) {
    if(this.displayReplacement && this.displayReplacement.rowKey){
      moveItemInArray(
        this.displayReplacement.rowKey,
        event.previousIndex,
        event.currentIndex
      );
      this.saveReplacementInLocalStorage(true);
    }
  }

  dropDecimalPlaceOrder(event: CdkDragDrop<string[]>) {
    if(this.displayReplacement && this.displayReplacement.decimalPlace){
      moveItemInArray(
        this.displayReplacement.decimalPlace,
        event.previousIndex,
        event.currentIndex
      );
      this.saveReplacementInLocalStorage(true);
    }
  }

  dragMoved(event: any): void{
    this.height = event.source.element.nativeElement.offsetHeight;
    console.warn(event.source)
    console.warn(event.source.element.nativeElement.offsetHeight)
    console.warn(event.source.element.nativeElement.clientHeight);

  }

  cdkDragStarted(event:any, dropIndex: number): void{
    this.height = event.source.element.nativeElement.offsetHeight;
    console.warn(this.height)
  }

  editOrder(i: number, item: string[]): void {
    this.invoiceKeyList = item;
    this.isEdit = true;
    this.isAdding = false;
    this.editingIndex = i;
    this.isChanged = false;
    this.listName = this.listNames[this.editingIndex];
    this.editLayoutList?.nativeElement.scrollIntoView({
      behavior: 'smooth',
    });
  }

  deleteObjFromList(i: number, item: string[]): void {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      showClass: {
        popup: 'animate__animated animate__fadeInDown',
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.allFiledNameList.splice(i, 1);
        this.listNames.splice(i, 1);
        localStorage.setItem(
          this.storageName,
          JSON.stringify(this.allFiledNameList)
        );
        localStorage.setItem(this.storageListNames, JSON.stringify(this.listNames));
        let savedIndex = Number(localStorage.getItem(this.storageIndex));
        if(!isNaN(savedIndex) && savedIndex == i){
          if(savedIndex > 0){
            this.selectedIndex = --savedIndex;
            localStorage.setItem(this.storageIndex, String(this.selectedIndex));
          }
          else{
            localStorage.removeItem(this.storageIndex);
            this.selectedIndex = undefined;
          }
        }
        else if(i < savedIndex){
          if(savedIndex > 0){
            this.selectedIndex = --savedIndex;
            localStorage.setItem(this.storageIndex, String(this.selectedIndex));
          }
        }
        this.Toast.fire({
          icon: 'success',
          title: 'Deleted!',
        });
      }
    });
  }

  cancelEditing(): void {
    if (
      (this.inputToBeAdded !== undefined && this.inputToBeAdded !== '') ||
      this.isChanged
    ) {
      Swal.fire({
        title: 'Do you want to save the changes?',
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: 'Save',
        denyButtonText: `Don't save`,
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
          if (this.inputToBeAdded !== undefined) {
            this.saveInvoiceColumn();
          }
          this.saveEditing();
          // Swal.fire('Saved!', '', 'success');
        } else if (result.isDenied) {
          this.inputToBeAdded = undefined;
          this.isChanged = false;
          this.cancelEditing();
          // Swal.fire('Changes are not saved', '', 'info');
          this.ToastTop.fire({
            icon: 'info',
            title: 'Changes are not saved',
          });
        }
      });
    } else {
      if (this.inputToBeAdded === '') {
        this.inputToBeAdded = undefined;
      }
      this.sync();
    }
  }

  saveInvoiceColumn(): void {
    if (this.inputToBeAdded !== undefined) {
      this.inputToBeAdded = this.inputToBeAdded.trim();
      if (this.inputToBeAdded !== '') {
        this.invoiceKeyList.push(this.inputToBeAdded);
        this.isChanged = true;
        this.inputToBeAdded = undefined;
        if (!this.isSportMode) {
          this.isAdding = false;
        }
      } else {
        this.addShakingAnimation('add-input');
      }
    } else {
      this.addShakingAnimation('add-input');
    }
  }

  sync(): void {
    const tempList = localStorage.getItem(this.storageName);
    if(tempList !== null){
      const storageList: Array<string[]> = JSON.parse(tempList);
      if (storageList !== null) {
        this.allFiledNameList = storageList;
        if (this.editingIndex !== undefined && this.editingIndex > -1) {
          this.invoiceKeyList = storageList[this.editingIndex];
        }
      } else {
        if (this.editingIndex !== undefined && this.editingIndex > -1) {
          this.allFiledNameList[this.editingIndex] = this.createADefaultKeyObj();
          this.invoiceKeyList = this.allFiledNameList[this.editingIndex];
        }
      }
    }
    this.isEdit = false;
    this.editingIndex = undefined;
  }

  resetToDefault(): void{
    Swal.fire({
      title: 'Are you  you want to reset everything to default?',
      text: "Everything you save in your computer will be gone and you won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, reset it!'
    }).then((result) => {
      if (result.isConfirmed) {
        let timerInterval: any;
        Swal.fire({
          title: 'Countdown...',
          html: '<b></b> <strong>to begin resetting</strong>. <br><br><br> <small style="color: red">You cna CLICK outside of box to cancel it</small>',
          timer: 10000,
          timerProgressBar: true,
          didOpen: () => {
            Swal.showLoading()
            const b = Swal.getHtmlContainer()?.querySelector('b')
            timerInterval = setInterval(() => {
              b!.textContent = String(this.millisToMinutesAndSeconds(Swal.getTimerLeft()))
            }, 100)
          },
          willClose: () => {
            clearInterval(timerInterval)
          }
        }).then((result) => {
          /* Read more about handling dismissals below */
          if (result.dismiss === Swal.DismissReason.timer) {
            localStorage.clear();
            // this.selectedIndex = 0;
            // const temp: string[] = this.createADefaultKeyObj();
            // this.allFiledNameList = [];
            // this.allFiledNameList.push(temp);
            // this.invoiceKeyList = temp;
            // this.isAutoDownload = true;
            // this.tempName = this.exportFileName;
            // this.isExcelOnly = true;
            // this.isSportMode = true;
            // this.errorMsg = [];
            // this.listNames = [];
            // this.replacements = [];
            // this.displayReplacement = undefined;
            // this.orderList = [];
            // this.isUsingAdvance = false;
            // Swal.fire({
            //   title: 'Done!',
            //   html: 'Everything has been reset. <br> Thank you for your patience!',
            //   icon: 'success',
            //   didClose: () => window.scrollTo({
            //     top: 0,
            //     left: 0,
            //     behavior: 'smooth'
            //   })
            // });
            Swal.fire({
              title: 'Done!',
              html: 'Everything has been reset. <br> Thank you for your patience!',
              icon: 'success',
              didClose: () => window.scrollTo({
                top: 0,
                left: 0,
                behavior: 'smooth'
              })
            }).then((result) => {
              // Reload the Page
              window.scrollTo({
                top: 0,
                left: 0,
                behavior: 'smooth'
              })
              setTimeout(()=>{
                location.reload();
              }, 1000)

            });
          }
        });
      }
    });
  }

  millisToMinutesAndSeconds(millis: any): any {
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ":" + ((Number(seconds) < 10) ? '0' : '') + seconds;
  }

  saveEditing(): void {
    if(this.invoiceKeyList.length > 0){
      this.isEdit = false;
      if (this.editingIndex === -1) {
        this.selectedIndex = this.allFiledNameList.length;
        this.allFiledNameList.push(this.invoiceKeyList);
      } else {
        this.selectedIndex = this.editingIndex;
      }
      this.selectedKeyList = this.invoiceKeyList;
      localStorage.setItem(
        this.storageName,
        JSON.stringify(this.allFiledNameList)
      );
      localStorage.setItem(this.storageIndex, String(this.selectedIndex));
      if(this.listName !== undefined && this.selectedIndex !== undefined){
        // this.listName = this.listName.trim();
        // if(this.listName !== ''){
        //   this.listNames[this.selectedIndex] = this.listName.trim();
        //   localStorage.setItem(this.storageListNames, JSON.stringify(this.listNames));
        //   this.listName = undefined;
        // }
        this.listNames[this.selectedIndex] = this.listName.trim();
        localStorage.setItem(this.storageListNames, JSON.stringify(this.listNames));
        this.listName = undefined;
      }
      this.Toast.fire({
        icon: 'success',
        title: 'Saved!',
      });
      this.sync();
    }
    else{
      this.ToastTop.fire({
        icon: 'error',
        title: 'Cannot save due to empty layout',
      });
    }

  }

  restoreFieldName(): void {
    this.invoiceKeyList = this.createADefaultKeyObj();
    if(this.editingIndex && this.editingIndex>0 && this.editingIndex < this.allFiledNameList.length){
      this.allFiledNameList[this.editingIndex] = this.invoiceKeyList;
    }
    this.inputToBeAdded = undefined;
    this.isAdding = false;
    this.isChanged = true;
  }

  clearAllFieldName(): void {
    this.invoiceKeyList = [];
    if(this.editingIndex && this.editingIndex>0 && this.editingIndex < this.allFiledNameList.length){
      this.allFiledNameList[this.editingIndex] = this.invoiceKeyList;
    }
    this.inputToBeAdded = undefined;
    this.isAdding = false;
    this.isChanged = true;
  }

  createADefaultKeyObjGlobally(): void {
    const invoice = new Invoice();
    this.invoiceKeyList = Object.keys(invoice);
    this.allFiledNameList.push(this.invoiceKeyList);
  }

  createADefaultKeyObj(): string[] {
    const invoice = new Invoice();
    return Object.keys(invoice);
  }

  changeAcceptedFile(): void {
    this.isExcelOnly = !this.isExcelOnly;
    let cb: IBehavior | undefined = this.behavior;
    if (cb !== undefined) {
      cb.fileAccepted = this.isExcelOnly;
    } else {
      cb = new Behavior();
      cb.fileAccepted = this.isExcelOnly;
    }
    this.behavior = cb;
    localStorage.setItem(this.storageCB, JSON.stringify(this.behavior));
  }

  closeErrorMsg(item: IErrorMsg): void {
    item.isDisplayed = false;
  }

  resetFile() {
    this.myInputVariable!.nativeElement.value = '';
  }

  delItems(i: number): void {
    this.invoiceKeyList.splice(i, 1);
    this.isChanged = true;
    this.isAdding = false;
  }

  prepareAddingInput(): void {
    this.isAdding = !this.isAdding;
  }

  changeMode(): void {
    this.isSportMode = !this.isSportMode;
    let cb: IBehavior | undefined = this.behavior;
    if (cb !== undefined) {
      cb.addingMode = this.isSportMode;
    } else {
      cb = new Behavior();
      cb.addingMode = this.isSportMode;
    }
    this.behavior = cb;
    localStorage.setItem(this.storageCB, JSON.stringify(this.behavior));
  }

  editExportFileName(): void {
    this.isEditExportFileName = true;
    this.tempName = this.exportFileName;
  }

  cancelExportFileName(): void {
    this.isEditExportFileName = false;
  }

  saveExportFileName(): void {
    if (this.tempName !== undefined) {
      this.tempName = this.tempName.trim();
      if (this.tempName !== '') {
        this.exportFileName = this.tempName;
        this.isEditExportFileName = false;
        let cb: IBehavior | undefined = this.behavior;
        if (cb !== undefined) {
          cb.fileName = this.exportFileName;
        } else {
          cb = new Behavior();
          cb.fileName = this.exportFileName;
        }
        this.behavior = cb;
        localStorage.setItem(this.storageCB, JSON.stringify(this.behavior));
      } else {
        this.addShakingAnimation('file-name-input-group');
      }
    } else {
      this.addShakingAnimation('file-name-input-group');
    }
  }

  changeAutoDownload(): void {
    this.isAutoDownload = !this.isAutoDownload;
    let cb: IBehavior | undefined = this.behavior;
    if (cb !== undefined) {
      cb.auto = this.isAutoDownload;
    } else {
      cb = new Behavior();
      cb.auto = this.isAutoDownload;
    }
    this.behavior = cb;
    localStorage.setItem(this.storageCB, JSON.stringify(this.behavior));
  }

  switchHeaders(): void{
    this.isColumnHeaderChanged = !this.isColumnHeaderChanged;
    let cb: IBehavior | undefined = this.behavior;
    if (cb !== undefined) {
      cb.headerConvertor = this.isColumnHeaderChanged;
    } else {
      cb = new Behavior();
      cb.headerConvertor = this.isColumnHeaderChanged;
    }
    this.behavior = cb;
    localStorage.setItem(this.storageCB, JSON.stringify(this.behavior));
  }

  downloadTheFile(index: number): void {
    // this.excelService.exportAsExcelFile(item, this.exportFileName, false);
    this.excelService.exportAsExcelFile(
      this.outputList[index],
      this.exportFileName,
      false,
      this.outputTypeIndex
    );
  }

  showDownloadFileBtn(): void {
    if (this.checkIfOutputListNotEmpty()) {
      this.isShowDownloadBtn = false;
      this.hasOutput = true;
    } else {
      const msgObj = new ErrorMsg();
      msgObj.msg = 'Sorry! There is no files';
      msgObj.isDisplayed = true;
      if (this.errorMsg === undefined) {
        this.errorMsg = [];
      }
      this.errorMsg.push(msgObj);
    }
  }

  showCreatingBtn(): void {
    this.isCreatingBtnAppeared = !this.isCreatingBtnAppeared;
  }

  createBlankKey(event: any): void {
    event.stopPropagation();
    this.isCreatingBtnAppeared = false;
    this.editOrder(-1, []);
    this.editArea?.nativeElement.scrollIntoView({
      behavior: 'smooth',
    });
  }

  createUnblankKey(event: any): void {
    event.stopPropagation();
    this.isCreatingBtnAppeared = false;
    this.editOrder(-1, this.createADefaultKeyObj());
    this.editArea?.nativeElement.scrollIntoView({
      behavior: 'smooth',
    });
  }

  setSelectedIndexForLayout(i: number, items: string[]): void {
    this.selectedIndex = i;
    this.selectedKeyList = items;
    localStorage.setItem(this.storageIndex, String(i));
    this.invoiceKeyList = this.selectedKeyList;
  }

  editDefaultLayout(): void {
    this.isEditingLayout = true;
  }

  scrollToLayoutList(i: number): void {
    // this.layoutList[i];
    this.layoutList?.forEach((item, index) => {
      if (i === index) {
        item.nativeElement.scrollIntoView({
          behavior: 'smooth',
        });
      }
    });
  }

  scrollToTop(): void{
    this.topOne?.nativeElement.scrollIntoView({
      behavior: 'smooth',
    });
  }

  scroll(el: HTMLElement) {
    el.scrollIntoView();
  }
  // scroll() {}

  editReplacements(event: any, item: IReplacement): void{
    // event.stopPropagation()
    // if(item.editName === undefined || item.editName === ''){
    //   item.editName = item.name;
    // }
    item.editName = item.name;
    item.isEditing = !item.isEditing;
    item.isJustCreated = false;
  }

  saveReplacementName(event: any, item: IReplacement, index: number): void{
    // event.stopPropagation();
    if(item.editName !== undefined){
      item.editName = item.editName.trim();
      if(item.editName.length > 0){
        item.name = item.editName;
        item.editName = undefined;
        item.isEditing = false;
        item.isJustCreated = false;
        this.selectReplacement(event, item, index);
        this.saveReplacementInLocalStorage();
        this.Toast.fire({
          icon: 'success',
          title: 'Saved!'
        });
        console.warn(item);
        console.warn(this.displayReplacement)
        console.warn(this.replacements)
      }
      else{
        this.ToastTop.fire({
          icon: 'error',
          title: 'Name cannot be null!!!'
        });
        this.addShakingAnimation('edit-name-input' + index);
      }
    }
    else{
      this.ToastTop.fire({
        icon: 'error',
        title: 'Name cannot be null!!!'
      });
      this.addShakingAnimation('edit-name-input' + index);
    }
  }

  cancelReplacement(event: any, item: IReplacement, index: number): void{
    if(item.isJustCreated){
      if(item.editName !== undefined && item.editName.trim() !== ''){
        Swal.fire({
          title: 'Do you want to create the ' + item.editName + ' ?',
          showDenyButton: true,
          showCancelButton: true,
          confirmButtonText: 'Create',
          denyButtonText: `Don't create`,
        }).then((result) => {
          /* Read more about isConfirmed, isDenied below */
          if (result.isConfirmed) {
            this.saveReplacementName(event, item, index);
          } else if (result.isDenied) {
            this.ToastTop.fire({
              icon: 'info',
              title: 'Nothing has been changed!!!'
            });
            this.replacements?.splice(index, 1);
            item.isEditing = false;
          }
        });
      }
      else{
        this.replacements?.splice(index, 1);
      }
      // this.deleteReplacement(event, item, index);
    }
    else{
      if(item.editName !== undefined && item.editName !== item.name){
        Swal.fire({
          title: 'Do you want to save the changes?',
          showDenyButton: true,
          showCancelButton: true,
          confirmButtonText: 'Save',
          denyButtonText: `Don't save`,
        }).then((result) => {
          /* Read more about isConfirmed, isDenied below */
          if (result.isConfirmed) {
            this.saveReplacementName(event, item, index);
          } else if (result.isDenied) {
            this.ToastTop.fire({
              icon: 'info',
              title: 'Changes are not saved'
            });
            item.isEditing = false;
          }
        });
      }
      else{
        item.isEditing = false;
      }
    }
  }

  saveReplacementInLocalStorage(doNotSaveTheBlanks?: boolean): void{
    if(this.replacements !== undefined){
      localStorage.setItem(this.storageReplaceName, JSON.stringify(this.rearrangeJustCreated(this.replacements, doNotSaveTheBlanks)));
    }
  }

  createReplacement(): void{
    const r: IReplacement = new Replacement();
    r.id = this.getUUID();
    r.isEditing = true;
    r.isJustCreated = true;
    if(this.replacements === undefined) {
      this.replacements = [];
    }
    this.replacements.push(r);
  }

  deleteReplacement(event: any, item: IReplacement, index: number, popup?: boolean): void{
    if(item.isJustCreated){
      item.editName = undefined;
      this.cancelReplacement(event, item, index);
    }
    else{
        Swal.fire({
          title: 'Are you sure you want to delete it',
          text: "You won't be able to revert this!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
          if (result.isConfirmed) {
              if(this.displayReplacement !== undefined){
                if(this.displayReplacement.id === item.id){
                  this.displayReplacement = undefined;
                }
              }
              this.replacements?.splice(index, 1);
              console.warn(this.replacements)
              this.saveReplacementInLocalStorage(true);
            this.Toast.fire({
              icon: 'success',
              title: 'Deleted!'
            });
          }
        });
    }
    // if(popup && !item.isJustCreated){
    //   Swal.fire({
    //     title: 'Are you sure you want to delete it',
    //     text: "You won't be able to revert this!",
    //     icon: 'warning',
    //     showCancelButton: true,
    //     confirmButtonColor: '#d33',
    //     cancelButtonColor: '#3085d6',
    //     confirmButtonText: 'Yes, delete it!'
    //   }).then((result) => {
    //     if (result.isConfirmed) {
    //       this.deleteReplacement(event, item, index, false);
    //       this.Toast.fire({
    //         icon: 'success',
    //         title: 'Deleted!'
    //       });
    //     }
    //   })
    // }
    // else {
    //   console.warn(this.replacements)
    //   if(this.displayReplacement !== undefined){
    //     if(this.displayReplacement.id === item.id){
    //       this.displayReplacement = undefined;
    //     }
    //   }
    //   this.replacements?.splice(index, 1);
    //   console.warn(this.replacements)
    //   this.saveReplacementInLocalStorage(true);
    // }
  }

  selectReplacement(event: any, item: IReplacement, i: number): void{
    // event.preventDefault();
    console.warn(item.checked)
    const originalCheck = item.checked;
    if(item.checked){
      this.displayReplacement = undefined;
    }
    else{
      this.displayReplacement = item;
    }
    if(this.replacements !== undefined){
      this.resetReplacementChecked(this.replacements, true, false, false, false, false);
    }
    item.checked = !originalCheck;
    this.addingOrderList();
    if(this.displayReplacement !== undefined){
      this.advanceThreeChoices?.nativeElement.scrollIntoView({
        behavior: 'smooth',
      });
    }
    console.warn(item.checked)
  }

  checkIfHasSame(targets: string[]): boolean{
    let result = false;
    for (const value of targets) {
      if(value === this.sameHeader){
        result = true;
      }
    }
    return result;
  }

  mergeTwoHeaders(headers: string[], excelHeaders: string[]): string[]{
    for (let i = 0; i < headers.length; i++) {
      if(headers[i] === this.sameHeader && i < excelHeaders.length){
        headers[i] = excelHeaders[i];
      }
    }
    return headers;
  }

  countSameHeaders(targets: string[]): number{
    let count = 0;
    targets.forEach((item: string) => {
      if(item === this.sameHeader){
        count++;
      }
    });
    return count;
  }

  getSameHeadersFromExcel(headers: string[], excelHeaders: string[]): string[]{
    const result = [];
    for (let i = 0; i < headers.length; i++) {
      if(headers[i] === this.sameHeader){
        result.push(excelHeaders[i]);
      }
    }
    return result;
  }

  setSameHeaders(): void{
    if(this.inputToBeAdded !== undefined){
      const target = this.inputToBeAdded.trim();
      if(target.length > 0 && target !== this.sameHeader){
        Swal.fire({
          title: 'Are you sure?',
          text: 'You want to change' + this.inputToBeAdded + ' to ' + this.sameHeader + ' ?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: 'rgba(139,139,139,0.69)',
          confirmButtonText: 'Yes, do it!',
          showClass: {
            popup: 'animate__animated animate__jackInTheBox'
          },
          hideClass: {
            popup: 'animate__animated animate__zoomOut'
          }
        }).then((result) => {
          if (result.isConfirmed) {
            this.inputToBeAdded = this.sameHeader;
            this.Toast.fire({
              icon: 'success',
              title: 'Changed!',
            });
          }
        });
      }
      else{
        this.inputToBeAdded = this.sameHeader;
      }
    }
    else{
      this.inputToBeAdded = this.sameHeader;
    }
  }

  editColumnKey(event: any, item: IColumnName): void{
    // if(item.editFrom === undefined){
    //   item.editFrom = item.from;
    // }
    // if(item.editTo === undefined){
    //   item.editTo = item.to;
    // }
    item.editFrom = item.from;
    item.editTo = item.to;
    item.isEditing = true;
    item.isJustCreated = false;
  }

  saveColumnKey(event: any, item: IColumnName, index: number): void{
    if(item.editFrom !== undefined && item.editTo !== undefined){
      item.editFrom = item.editFrom.trim();
      item.editTo = item.editTo.trim();
      if(item.editFrom.length > 0 && item.editTo.length > 0){
        if(item.editFrom === item.editTo){
          Swal.fire({
            title: '<strong>Are you sure you want to <u>continue?</u></strong>',
            text: 'Two columns are the same (' + item.editFrom + ' to ' + item.editTo + '). It won\'t change anything in your file!!!',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            confirmButtonColor: '#d33',
          }).then((result) => {
            /* Read more about isConfirmed, isDenied below */
            if (result.isConfirmed) {
              this.save(event, item, index);
            }
          });
        }
        else{
          this.save(event, item, index);
        }
      }
      else{
        this.ToastTop.fire({
          icon: 'error',
          title: 'Name cannot be empty!!!'
        });
        if(item.editFrom.length <= 0){
          this.addShakingAnimation('edit-columnKey-from-input' + index);
        }
        if(item.editTo.length <= 0){
          this.addShakingAnimation('edit-columnKey-to-input' + index);
        }
      }
    }
    else{
      this.ToastTop.fire({
        icon: 'error',
        title: 'Name cannot be empty!!!'
      });
      if(item.editFrom === undefined){
        this.addShakingAnimation('edit-columnKey-from-input' + index);
      }
      if(item.editTo === undefined){
        this.addShakingAnimation('edit-columnKey-to-input' + index);
      }
    }
  }

  cancelColumnKey(event: any, item: IColumnName, index: number): void{
    if(item.isJustCreated){
      if(
        item.editFrom !== undefined && item.editFrom.trim() !== '' &&
        item.editTo !== undefined && item.editTo.trim() !== ''
      ){
        Swal.fire({
          title: 'Do you want to create the entity of ' + item.editFrom + ' to ' + item.editTo + ' ?',
          showDenyButton: true,
          showCancelButton: true,
          confirmButtonText: 'Create',
          denyButtonText: `Don't create`,
        }).then((result) => {
          /* Read more about isConfirmed, isDenied below */
          if (result.isConfirmed) {
            this.saveColumnKey(event, item, index);
          } else if (result.isDenied) {
            this.ToastTop.fire({
              icon: 'info',
              title: 'Nothing has been changed!!!'
            });
            this.displayReplacement?.columnKey?.splice(index, 1);
            item.isEditing = false;
          }
        });
      }
      else{
        this.displayReplacement?.columnKey?.splice(index, 1);
      }
    }
    else{
      if(item.editFrom !== undefined && item.editFrom !== item.from || item.editTo !== undefined && item.editTo !== item.to){
        Swal.fire({
          title: 'Do you want to save the changes?',
          showDenyButton: true,
          showCancelButton: true,
          confirmButtonText: 'Save',
          denyButtonText: `Don't save`,
        }).then((result) => {
          /* Read more about isConfirmed, isDenied below */
          if (result.isConfirmed) {
            this.saveColumnKey(event, item, index);
          } else if (result.isDenied) {
            this.ToastTop.fire({
              icon: 'info',
              title: 'Changes are not saved'
            });
            item.isEditing = false;
          }
        })
      }
      else{
        item.isEditing = false;
      }
    }
  }

  deleteColumnKey(event: any, item: IColumnName, index: number): void{
    if(item.isJustCreated){
      item.editFrom = undefined;
      item.editTo = undefined;
      this.cancelColumnKey(event, item, index);
    }
    else{
      Swal.fire({
        title: 'Are you sure you want to delete it',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
      }).then((result) => {
        if (result.isConfirmed) {
          this.displayReplacement?.columnKey?.splice(index, 1);
          this.removeOrderList(0);
          this.saveReplacementInLocalStorage(true);
          this.Toast.fire({
            icon: 'success',
            title: 'Deleted!'
          });
        }
      });
    }
    // if(popup && !item.isJustCreated){
    //   Swal.fire({
    //     title: 'Are you sure you want to delete it',
    //     text: "You won't be able to revert this!",
    //     icon: 'warning',
    //     showCancelButton: true,
    //     confirmButtonColor: '#d33',
    //     cancelButtonColor: '#3085d6',
    //     confirmButtonText: 'Yes, delete it!'
    //   }).then((result) => {
    //     if (result.isConfirmed) {
    //       this.deleteColumnKey(event, item, index, false);
    //       this.Toast.fire({
    //         icon: 'success',
    //         title: 'Deleted!'
    //       });
    //     }
    //   })
    // }
    // else {
    //   this.displayReplacement?.columnKey?.splice(index, 1);
    //   this.saveReplacementInLocalStorage();
    // }
  }

  selectColumnKey(event: any, item: IColumnName, index: number): void{
    item.checked = !item.checked;
    this.saveReplacementInLocalStorage(true);
  }

  createColumnKey(): void{
    const c: IColumnName = new ColumnName();
    c.id = this.getUUID();
    c.isEditing = true;
    c.isJustCreated = true;
    if(this.displayReplacement !== undefined){
      if(this.displayReplacement.columnKey === undefined) {
        this.displayReplacement.columnKey = [];
      }
    }
    this.displayReplacement?.columnKey?.push(c);
  }

  editReplaceKey(event: any, item: IReplaceName): void{
    item.editColumnName = item.columnName;
    item.editFrom = item.from;
    item.editTo = item.to;
    item.isEditing = true;
    item.isJustCreated = false;
  }

  saveReplaceKey(event: any, item: IReplaceName, index: number): void{
    if(
      item.editFrom !== undefined &&
      item.editTo !== undefined &&
      item.editColumnName !== undefined
    ){
      item.editColumnName = item.editColumnName.trim();
      item.editFrom = item.editFrom.trim();
      item.editTo = item.editTo.trim();
      if(
        item.editFrom.length > 0 &&
        item.editTo.length > 0 &&
        item.editColumnName.length > 0
      ){
        if(item.editFrom === item.editTo){
          Swal.fire({
            title: '<strong>Are you sure you want to <u>continue?</u></strong>',
            text: 'Two columns are the same (' + item.editFrom + ' to ' + item.editTo + '). It won\'t change anything in your file!!!',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            confirmButtonColor: '#d33',
          }).then((result) => {
            /* Read more about isConfirmed, isDenied below */
            if (result.isConfirmed) {
              this.save(event, item, index);
            }
          });
        }
        else{
          this.save(event, item, index);
        }
      }
      else{
        this.ToastTop.fire({
          icon: 'error',
          title: 'Name cannot be empty!!!'
        });
        if(item.editColumnName.length <= 0){
          this.addShakingAnimation('edit-replaceKey-columnName-input' + index);
        }
        if(item.editFrom.length <= 0){
          this.addShakingAnimation('edit-replaceKey-from-input' + index);
        }
        if(item.editTo.length <= 0){
          this.addShakingAnimation('edit-replaceKey-to-input' + index);
        }
      }
    }
    else{
      this.ToastTop.fire({
        icon: 'error',
        title: 'Name cannot be empty!!!'
      });
      if(item.editColumnName === undefined){
        this.addShakingAnimation('edit-replaceKey-columnName-input' + index);
      }
      if(item.editFrom === undefined){
        this.addShakingAnimation('edit-replaceKey-from-input' + index);
      }
      if(item.editTo === undefined){
        this.addShakingAnimation('edit-replaceKey-to-input' + index);
      }
    }
  }

  cancelReplaceKey(event: any, item: IReplaceName, index: number): void{
    if(item.isJustCreated){
      if(
        item.editFrom !== undefined && item.editFrom.trim() !== '' &&
        item.editTo !== undefined && item.editTo.trim() !== '' &&
        item.editColumnName !== undefined && item.editColumnName.trim() !== ''
      ){
        Swal.fire({
          title: 'Do you want to create the entity (name: '+ item.editColumnName +' ) of ' + item.editFrom + ' to ' + item.editTo + ' ?',
          showDenyButton: true,
          showCancelButton: true,
          confirmButtonText: 'Create',
          denyButtonText: `Don't create`,
        }).then((result) => {
          /* Read more about isConfirmed, isDenied below */
          if (result.isConfirmed) {
            this.saveReplaceKey(event, item, index);
          } else if (result.isDenied) {
            this.ToastTop.fire({
              icon: 'info',
              title: 'Nothing has been changed!!!'
            });
            this.displayReplacement?.replaceKey?.splice(index, 1);
            item.isEditing = false;
          }
        });
      }
      else{
        this.displayReplacement?.replaceKey?.splice(index, 1);
      }
    }
    else{
      if(
        item.editFrom !== undefined && item.editFrom !== item.from ||
        item.editTo !== undefined && item.editTo !== item.to ||
        item.editColumnName !== undefined && item.editColumnName !== item.columnName
      ){
        Swal.fire({
          title: 'Do you want to save the changes?',
          showDenyButton: true,
          showCancelButton: true,
          confirmButtonText: 'Save',
          denyButtonText: `Don't save`,
        }).then((result) => {
          /* Read more about isConfirmed, isDenied below */
          if (result.isConfirmed) {
            this.saveReplaceKey(event, item, index);
          } else if (result.isDenied) {
            this.ToastTop.fire({
              icon: 'info',
              title: 'Changes are not saved'
            });
            item.isEditing = false;
          }
        })
      }
      else{
        item.isEditing = false;
      }
    }
  }

  deleteReplaceKey(event: any, item: IReplaceName, index: number): void{
    if(item.isJustCreated){
      item.editFrom = undefined;
      item.editTo = undefined;
      item.editColumnName = undefined;
      this.cancelReplaceKey(event, item, index);
    }
    else{
      Swal.fire({
        title: 'Are you sure you want to delete it',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
      }).then((result) => {
        if (result.isConfirmed) {
          this.displayReplacement?.replaceKey?.splice(index, 1);
          this.removeOrderList(1);
          this.saveReplacementInLocalStorage(true);
          this.Toast.fire({
            icon: 'success',
            title: 'Deleted!'
          });
        }
      });
    }
    // if(popup && !item.isJustCreated){
    //   Swal.fire({
    //     title: 'Are you sure you want to delete it',
    //     text: "You won't be able to revert this!",
    //     icon: 'warning',
    //     showCancelButton: true,
    //     confirmButtonColor: '#d33',
    //     cancelButtonColor: '#3085d6',
    //     confirmButtonText: 'Yes, delete it!'
    //   }).then((result) => {
    //     if (result.isConfirmed) {
    //       this.deleteReplaceKey(event, item, index, false);
    //       this.Toast.fire({
    //         icon: 'success',
    //         title: 'Deleted!'
    //       });
    //     }
    //   })
    // }
    // else {
    //   this.displayReplacement?.replaceKey?.splice(index, 1);
    //   this.saveReplacementInLocalStorage();
    // }
  }

  selectReplaceKey(event: any, item: IReplaceName, index: number): void{
    item.checked = !item.checked;
    this.saveReplacementInLocalStorage(true);
  }

  createReplaceKey(): void{
    const n: IReplaceName = new ReplaceName();
    n.id = this.getUUID();
    n.isEditing = true;
    n.isJustCreated = true;
    if(this.displayReplacement !== undefined){
      if(this.displayReplacement.replaceKey === undefined) {
        this.displayReplacement.replaceKey = [];
      }
    }
    this.displayReplacement?.replaceKey?.push(n);
  }

  editRowKey(event: any, item: IRowName): void{
    item.editFrom = item.from;
    item.editTo = item.to;
    item.isEditing = true;
    item.isJustCreated = false;
  }

  saveRowKey(event: any, item: IRowName, index: number): void{
    if(item.editFrom !== undefined && item.editTo !== undefined){
      item.editFrom = item.editFrom.trim();
      item.editTo = item.editTo.trim();
      if(item.editFrom.length > 0 && item.editTo.length > 0){
        if(item.editFrom === item.editTo){
          Swal.fire({
            title: '<strong>Are you sure you want to <u>continue?</u></strong>',
            text: 'Two columns are the same (' + item.editFrom + ' to ' + item.editTo + '). It won\'t change anything in your file!!!',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            confirmButtonColor: '#d33',
          }).then((result) => {
            /* Read more about isConfirmed, isDenied below */
            if (result.isConfirmed) {
              this.save(event, item, index);
            }
          });
        }
        else{
          this.save(event, item, index);
        }

      }
      else{
        this.ToastTop.fire({
          icon: 'error',
          title: 'Name cannot be empty!!!'
        });
        if(item.editFrom.length <= 0){
          this.addShakingAnimation('edit-rowKey-from-input' + index);
        }
        if(item.editTo.length <= 0){
          this.addShakingAnimation('edit-rowKey-to-input' + index);
        }
      }
    }
    else{
      this.ToastTop.fire({
        icon: 'error',
        title: 'Name cannot be empty!!!'
      });
      if(item.editFrom === undefined){
        this.addShakingAnimation('edit-rowKey-from-input' + index);
      }
      if(item.editTo === undefined){
        this.addShakingAnimation('edit-rowKey-to-input' + index);
      }
    }
  }

  cancelRowKey(event: any, item: IRowName, index: number): void{
    if(item.isJustCreated){
      if(
        item.editFrom !== undefined && item.editFrom.trim() !== '' &&
        item.editTo !== undefined && item.editTo.trim() !== ''
      ){
        Swal.fire({
          title: 'Do you want to create the entity of ' + item.editFrom + ' to ' + item.editTo + ' ?',
          showDenyButton: true,
          showCancelButton: true,
          confirmButtonText: 'Create',
          denyButtonText: `Don't create`,
        }).then((result) => {
          /* Read more about isConfirmed, isDenied below */
          if (result.isConfirmed) {
            this.saveRowKey(event, item, index);
          } else if (result.isDenied) {
            this.ToastTop.fire({
              icon: 'info',
              title: 'Nothing has been changed!!!'
            });
            this.displayReplacement?.rowKey?.splice(index, 1);
            item.isEditing = false;
          }
        });
      }
      else{
        this.displayReplacement?.rowKey?.splice(index, 1);
      }
    }
    else{
      if(item.editFrom !== undefined && item.editFrom !== item.from ||
        item.editTo !== undefined && item.editTo !== item.to){
        Swal.fire({
          title: 'Do you want to save the changes?',
          showDenyButton: true,
          showCancelButton: true,
          confirmButtonText: 'Save',
          denyButtonText: `Don't save`,
        }).then((result) => {
          /* Read more about isConfirmed, isDenied below */
          if (result.isConfirmed) {
            this.saveRowKey(event, item, index);
          } else if (result.isDenied) {
            this.ToastTop.fire({
              icon: 'info',
              title: 'Changes are not saved'
            });
            item.isEditing = false;
          }
        })
      }
      else{
        item.isEditing = false;
      }
    }
  }

  deleteRowKey(event: any, item: IColumnName, index: number): void{
    if(item.isJustCreated){
      item.editFrom = undefined;
      item.editTo = undefined;
      this.cancelRowKey(event, item, index);
    }
    else{
      Swal.fire({
        title: 'Are you sure you want to delete it',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
      }).then((result) => {
        if (result.isConfirmed) {
          this.displayReplacement?.rowKey?.splice(index, 1);
          this.removeOrderList(2);
          this.saveReplacementInLocalStorage(true);
          this.Toast.fire({
            icon: 'success',
            title: 'Deleted!'
          });
        }
      });
    }
    // if(popup && !item.isJustCreated){
    //   Swal.fire({
    //     title: 'Are you sure you want to delete it',
    //     text: "You won't be able to revert this!",
    //     icon: 'warning',
    //     showCancelButton: true,
    //     confirmButtonColor: '#d33',
    //     cancelButtonColor: '#3085d6',
    //     confirmButtonText: 'Yes, delete it!'
    //   }).then((result) => {
    //     if (result.isConfirmed) {
    //       this.deleteColumnKey(event, item, index);
    //       this.Toast.fire({
    //         icon: 'success',
    //         title: 'Deleted!'
    //       });
    //     }
    //   })
    // }
    // else {
    //   this.displayReplacement?.rowKey?.splice(index, 1);
    //   this.saveReplacementInLocalStorage();
    // }
  }

  selectRowKey(event: any, item: IReplaceName, index: number): void{
    item.checked = !item.checked;
    this.saveReplacementInLocalStorage(true);
  }

  createRowKey(): void{
    console.warn('create')
    const n: IRowName = new RowName();
    n.id = this.getUUID();
    n.isEditing = true;
    n.isJustCreated = true;
    if(this.displayReplacement !== undefined){
      if(this.displayReplacement.rowKey === undefined) {
        this.displayReplacement.rowKey = [];
      }
    }
    this.displayReplacement?.rowKey?.push(n);
  }

  editDecimalPlace(event: any, item: IDecimalPlaces): void{
    item.editColumnName = item.columnName;
    item.editDecimalPlacesOption = item.decimalPlacesOption;
    item.editMathMethod = item.mathMethod;
    if(
      item.editDecimalPlacesOption !== undefined &&
      item.decimalPlacesOptionList !== undefined &&
      item.decimalPlacesOptionList.length < (item.editDecimalPlacesOption.length - 1)
    ){
      item.decimalPlacesOptionList = this.getDecimalPlaces(item.editDecimalPlacesOption.length - 1);
    }
    item.isEditing = true;
    item.isJustCreated = false;

  }

  saveDecimalPlace(event: any, item: IDecimalPlaces, index: number): void{
    if(
      item.editDecimalPlacesOption !== undefined &&
      item.editColumnName !== undefined &&
      item.editMathMethod !== undefined
    ){
      item.editColumnName = item.editColumnName.trim();
      if(
        item.editColumnName.length > 0 &&
        item.editDecimalPlacesOption.length > 0 &&
        item.editMathMethod.length > 0
      ){
        this.decimalPlaceSave(event, item, index);
      }
      else{
        this.ToastTop.fire({
          icon: 'error',
          title: 'Name cannot be empty!!!'
        });
        if(item.editColumnName.length <= 0){
          this.addShakingAnimation('edit-decimalPlace-columnName-input' + index);
        }
      }
    }
    else{
      this.ToastTop.fire({
        icon: 'error',
        title: 'Name cannot be empty!!!'
      });
      if(item.editColumnName === undefined){
        this.addShakingAnimation('edit-decimalPlace-columnName-input' + index);
      }
    }
  }

  cancelDecimalPlace(event: any, item: IDecimalPlaces, index: number): void{
    if(item.isJustCreated){
      if(
        item.editDecimalPlacesOption !== undefined && item.editDecimalPlacesOption.trim() !== '' &&
        item.editColumnName !== undefined && item.editColumnName.trim() !== ''
      ){
        Swal.fire({
          title: 'Do you want to create the entity (name: '+ item.editColumnName +' ) of ' + item.editDecimalPlacesOption + ' ?',
          showDenyButton: true,
          showCancelButton: true,
          confirmButtonText: 'Create',
          denyButtonText: `Don't create`,
        }).then((result) => {
          /* Read more about isConfirmed, isDenied below */
          if (result.isConfirmed) {
            this.saveDecimalPlace(event, item, index);
          } else if (result.isDenied) {
            this.ToastTop.fire({
              icon: 'info',
              title: 'Nothing has been changed!!!'
            });
            this.displayReplacement?.decimalPlace?.splice(index, 1);
            item.isEditing = false;
          }
        });
      }
      else{
        this.displayReplacement?.decimalPlace?.splice(index, 1);
      }
    }
    else{
      if(
        item.editDecimalPlacesOption !== undefined && item.editDecimalPlacesOption !== item.decimalPlacesOption ||
        item.editColumnName !== undefined && item.editColumnName !== item.columnName
      ){
        Swal.fire({
          title: 'Do you want to save the changes?',
          showDenyButton: true,
          showCancelButton: true,
          confirmButtonText: 'Save',
          denyButtonText: `Don't save`,
        }).then((result) => {
          /* Read more about isConfirmed, isDenied below */
          if (result.isConfirmed) {
            this.saveDecimalPlace(event, item, index);
          } else if (result.isDenied) {
            this.ToastTop.fire({
              icon: 'info',
              title: 'Changes are not saved'
            });
            item.isEditing = false;
          }
        })
      }
      else{
        item.isEditing = false;
      }
    }
  }

  deleteDecimalPlace(event: any, item: IDecimalPlaces, index: number): void{
    if(item.isJustCreated){
      item.editDecimalPlacesOption = undefined;
      item.editColumnName = undefined;
      this.cancelDecimalPlace(event, item, index);
    }
    else{
      Swal.fire({
        title: 'Are you sure you want to delete it',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
      }).then((result) => {
        if (result.isConfirmed) {
          this.displayReplacement?.decimalPlace?.splice(index, 1);
          this.removeOrderList(3);
          this.saveReplacementInLocalStorage(true);
          this.Toast.fire({
            icon: 'success',
            title: 'Deleted!'
          });
        }
      });
    }
  }

  selectDecimalPlace(event: any, item: IDecimalPlaces, index: number): void{
    item.checked = !item.checked;
    this.saveReplacementInLocalStorage(true);
  }

  createDecimalPlace(): void{
    const d: IDecimalPlaces = new DecimalPlace();
    d.id = this.getUUID();
    d.decimalPlacesOptionList = this.getDecimalPlaces(this.defaultPlaceValue);
    d.editDecimalPlacesOption = this.prefix;
    d.editMathMethod = this.floor;
    d.isEditing = true;
    d.isJustCreated = true;
    if(this.displayReplacement !== undefined){
      if(this.displayReplacement.decimalPlace === undefined) {
        this.displayReplacement.decimalPlace = [];
      }
    }
    this.displayReplacement?.decimalPlace?.push(d);
  }

  addDecimalPlacesToList(event: any, item: IDecimalPlaces, index: number): void{
    let qty = this.defaultPlaceValue;
    if(item.decimalPlacesOptionList !== undefined){
      qty = item.decimalPlacesOptionList.length > this.defaultPlaceValue ? item.decimalPlacesOptionList.length + 1 : this.defaultPlaceValue + 1;
    }
    item.decimalPlacesOptionList = this.getDecimalPlaces(qty);
  }

  resetDecimalPlacesList(event: any, item: IDecimalPlaces, index: number): void{
    item.editDecimalPlacesOption = this.prefix;
    item.decimalPlacesOptionList = this.getDecimalPlaces(this.defaultPlaceValue);
  }

  switchFromAndTo(event: any, item: IColumnName | IReplaceName | IRowName, index: number): void{
    const temp = item.editTo
    item.editTo = item.editFrom;
    item.editFrom = temp;
  }

  setFromNull(event: any, item: IColumnName | IReplaceName | IRowName, index: number): void{
    if(item.editTo === this.nullMsg){
      item.editTo = undefined;
    }
    if(item.editFrom === this.nullMsg){
      item.editFrom = undefined;
    }
    else{
      item.editFrom = this.nullMsg;
    }
  }

  setToNull(event: any, item: IColumnName | IReplaceName | IRowName, index: number): void{
    if(item.editFrom === this.nullMsg){
      item.editFrom = undefined;
    }
    if(item.editTo === this.nullMsg){
      item.editTo = undefined;
    }
    else{
      item.editTo = this.nullMsg;
    }
  }

  resetNull(event: any, item: IColumnName | IReplaceName | IRowName, index: number): void{
    if(item.editFrom === this.nullMsg){
      item.editFrom = undefined;
    }
    if(item.editTo === this.nullMsg){
      item.editTo = undefined;
    }
  }

  checkConvertTypeOption(i: number): boolean{
    return this.behavior?.outputFormatsIndex === undefined? i === 9 : Number(this.behavior.outputFormatsIndex) === i;
  }

  setConvertTypeOption(event: any): void{
    const selectedIndex = event.target.value;
    console.warn(selectedIndex)
    if(this.behavior === undefined){
      const cb = new Behavior();
      cb.outputFormatsIndex = selectedIndex;
      this.behavior = cb;
    }
    else {
      this.behavior.outputFormatsIndex = selectedIndex;
    }
    localStorage.setItem(this.storageCB, JSON.stringify(this.behavior));
  }

  swapOrder(option: number): void{
    const temp = this.orderList[option];
    this.orderList[option] = this.orderList[option+1];
    this.orderList[option+1] = temp;
  }

  checkIfDisplayOrder(index: number): boolean{
    switch(index) {
      case 0: {
        return this.displayReplacement?.columnKey !== undefined &&
          this.displayReplacement.columnKey !== null &&
          this.displayReplacement.columnKey.length > 0 &&
          !this.displayReplacement.columnKey[0].isJustCreated;
      }
      case 1: {
        return this.displayReplacement?.replaceKey !== undefined &&
          this.displayReplacement.replaceKey !== null &&
          this.displayReplacement.replaceKey.length > 0 &&
          !this.displayReplacement.replaceKey[0].isJustCreated;
      }
      case 2: {
        return this.displayReplacement?.rowKey !== undefined &&
          this.displayReplacement.rowKey !== null &&
          this.displayReplacement.rowKey.length > 0 &&
          !this.displayReplacement.rowKey[0].isJustCreated;
      }
      case 3: {
        return this.displayReplacement?.decimalPlace !== undefined &&
          this.displayReplacement.decimalPlace !== null &&
          this.displayReplacement.decimalPlace.length > 0 &&
          !this.displayReplacement.decimalPlace[0].isJustCreated;
      }
      default: {
        return false;
      }
    }
  }

  checkIfOneOfThemIsChecked(): boolean{
    let checkPoint = false;
    if(this.replacements !== undefined){
      this.replacements.forEach((r: IReplacement) => {
        if(r.checked){
          r.columnKey?.forEach((c: IColumnName) => {
            if(c.checked){
              checkPoint = true;
            }
          });
          r.replaceKey?.forEach((rk: IReplaceName) => {
            if(rk.checked){
              checkPoint = true;
            }
          });
          r.rowKey?.forEach((row: IRowName) => {
            if(row.checked){
              checkPoint = true;
            }
          });
          r.decimalPlace?.forEach((dp: IDecimalPlaces) => {
            if(dp.checked){
              checkPoint = true;
            }
          });
        }
      });
    }
    return checkPoint;
  }

  addingOrderList(): void{
    this.orderList = [];
    if(this.checkIfDisplayOrder(0) && !this.orderList.includes('A')){
      this.orderList.push('A');
    }
    if(this.checkIfDisplayOrder(1) && !this.orderList.includes('B')){
      this.orderList.push('B');
    }
    if(this.checkIfDisplayOrder(2) && !this.orderList.includes('C')){
      this.orderList.push('C');
    }
    if(this.checkIfDisplayOrder(3) && !this.orderList.includes('D')){
      this.orderList.push('D');
    }
    this.addingOrRevisingOrderListExchangeBtn();
  }

  addingOrRevisingOrderListExchangeBtn(): void{
    this.exchangeArrowBtnOfOrderList = [];
    for (let i = 1; i < this.orderList.length; i++) {
      this.exchangeArrowBtnOfOrderList.push(String(this.orderList.length));
    }
  }

  removeOrderList(option: number): void{
    let i: number;
    switch(option) {
      case 0: {
        i = this.orderList.indexOf('A');
        break;
      }
      case 1: {
        i = this.orderList.indexOf('B');
        break;
      }
      case 2: {
        i = this.orderList.indexOf('C');
        break;
      }
      case 3: {
        i = this.orderList.indexOf('D');
        break;
      }
      default: {
        i = -1;
      }
    }
    if(i > -1 && !this.checkIfDisplayOrder(option)){
      this.orderList.splice(i, 1);
    }
    this.addingOrRevisingOrderListExchangeBtn();
  }

  checkHowManyExchangeIcons(): number{
    let count = 0;
    if(this.displayReplacement !== undefined){
      if(
        this.displayReplacement.columnKey !== undefined &&
        this.displayReplacement.columnKey !== null &&
        this.displayReplacement.columnKey.length > 0 &&
        this.displayReplacement.columnKey[0].from !== undefined &&
        this.displayReplacement.columnKey[0].to !== undefined
      ){
        count++;
      }
      if(
        this.displayReplacement.replaceKey !== undefined &&
        this.displayReplacement.replaceKey !== null &&
        this.displayReplacement.replaceKey.length > 0 &&
        this.displayReplacement.replaceKey[0].columnName !== undefined &&
        this.displayReplacement.replaceKey[0].from !== undefined &&
        this.displayReplacement.replaceKey[0].to !== undefined
      ){
        count++;
      }
      if(
        this.displayReplacement.rowKey !== undefined &&
        this.displayReplacement.rowKey !== null &&
        this.displayReplacement.rowKey.length > 0 &&
        this.displayReplacement.rowKey[0].from !== undefined &&
        this.displayReplacement.rowKey[0].to !== undefined
      ){
        count++;
      }
      if(
        this.displayReplacement.decimalPlace !== undefined &&
        this.displayReplacement.decimalPlace !== null &&
        this.displayReplacement.decimalPlace.length > 0 &&
        this.displayReplacement.decimalPlace[0].columnName !== undefined &&
        this.displayReplacement.decimalPlace[0].decimalPlacesOption !== undefined &&
        this.displayReplacement.decimalPlace[0].mathMethod !== undefined
      ){
        count++;
      }
    }
    return count;
  }

  advanceReplace(invoiceObj: any, option: string): any{
    if(this.displayReplacement !== undefined){
      switch (option) {
        case 'A': {
          this.displayReplacement.columnKey?.forEach((c: IColumnName) => {
            if(c.checked){
              let newInvoiceObject = {};
              Object.keys(invoiceObj).forEach(key => {
                let from = c.from
                if(from === this.nullMsg){
                  from = "";
                }
                if (c.from !== undefined && c.to !== undefined && key === from) {
                  let to = c.to;
                  if(to === this.nullMsg){
                    to = ""
                  }
                  let newPair = { [to]: invoiceObj[key] };
                  newInvoiceObject = { ...newInvoiceObject, ...newPair }
                } else {
                  newInvoiceObject = { ...newInvoiceObject, [key]: invoiceObj[key] }
                }
              });
              invoiceObj = newInvoiceObject;
            }
          });
          break;
        }
        case 'B': {
          this.displayReplacement.replaceKey?.forEach((r: IReplaceName) => {
            if(r.checked){
              if(r.from !== undefined && r.to !== undefined && r.columnName !== undefined){
                if(invoiceObj.hasOwnProperty(r.columnName)){
                  let from = r.from;
                  if(from === this.nullMsg){
                    from = "";
                  }
                  if(invoiceObj[r.columnName] === from){
                    if(r.to === this.nullMsg){
                      invoiceObj[r.columnName] = "";
                    }
                    else {
                      invoiceObj[r.columnName] = r.to;
                    }
                  }
                }
              }
            }
          });
          break;
        }
        case 'C': {
          this.displayReplacement.rowKey?.forEach((row: IRowName) => {
            if(row.checked){
              if(row.from !== undefined && row.to !== undefined){
                Object.keys(invoiceObj).forEach(key => {
                  let from = row.from;
                  if(from === this.nullMsg){
                    from = "";
                  }
                  if(invoiceObj[key] === from){
                    if(row.to === this.nullMsg){
                      invoiceObj[key] = "";
                    }
                    else{
                      invoiceObj[key] = row.to;
                    }
                  }
                });
              }
            }
          });
          break;
        }
        case 'D': {
          this.displayReplacement.decimalPlace?.forEach((d: IDecimalPlaces) => {
            if(d.checked){
              if(
                d.columnName !== undefined &&
                d.decimalPlacesOption !== undefined &&
                d.mathMethod !== undefined &&
                d.calcDecimalPlaceDigit !== undefined
              ){
                Object.keys(invoiceObj).forEach(key => {
                  if(key === d.columnName){
                    let num = Number(invoiceObj[key]);
                    if(!isNaN(num)){
                      switch (d.mathMethod) {
                        case this.floor: {
                          if(d.calcDecimalPlaceDigit !== undefined){
                            invoiceObj[key] = this.floorPrecised(num, this.countNumberOfDigits(d.calcDecimalPlaceDigit, '0'));
                          }
                          break;
                        }
                        case this.round: {
                          if(d.calcDecimalPlaceDigit !== undefined){
                            invoiceObj[key] = this.roundPrecised(num, this.countNumberOfDigits(d.calcDecimalPlaceDigit, '0'));
                          }
                          break;
                        }
                        case this.ceil: {
                          if(d.calcDecimalPlaceDigit !== undefined){
                            invoiceObj[key] = this.ceilPrecised(num, this.countNumberOfDigits(d.calcDecimalPlaceDigit, '0'));
                          }
                          break;
                        }
                      }
                    }
                  }
                });
              }
            }
          });
        }
      }
    }
    return invoiceObj
  }

  controlAdvanceContainer(): void{
    if(this.isUsingAdvance && this.replacements !== undefined){
      this.resetReplacementChecked(this.replacements, true, false, false, false, false);
      this.displayReplacement = undefined;
    }
    this.isUsingAdvance = !this.isUsingAdvance;
    this.scrollToView(this.advanceArea);
  }

  finishAdvanceSetting(): void{
    if(this.checkIfOneOfThemIsChecked()){
      this.scrollToView(this.uploadArea);
    }
    else{
      Swal.fire({
        title: 'Are you sure you want to continue?',
        text: "Since you didn't select any replace rules, the advance setting won't apply when you convert your file!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, continue!'
      }).then((result) => {
        if (result.isConfirmed) {
          // Swal.fire({
          //   didClose: () => window.scrollTo(0,0)
          // })
          setTimeout(()=> {
            this.scrollToView(this.uploadArea);
          }, 350);
        }
      })
    }
  }

  scrollToColumnKeyCell(index: number): void{
    this.scrollToView(this.columnKeyCells?.get(index));
  }

  scrollToReplaceKeyCell(index: number): void{
    this.scrollToView(this.replaceKeyCells?.get(index));
  }

  scrollToReplaceAllCell(index: number): void{
    this.scrollToView(this.replaceAllCells?.get(index));
  }

  scrollToDecimalPlaceCell(index: number): void{
    this.scrollToView(this.decimalPlaceCells?.get(index));
  }

  expandOrCollapse(option: number, event: any): void{
    event.preventDefault();
    let temp = false;
    switch (option){
      case 0:{
        temp = this.columnKeyCollapsed;
        break;
      }
      case 1:{
        temp = this.replaceKeyCollapsed;
        break;
      }
      case 2:{
        temp = this.replaceAllCollapsed;
        break;
      }
      case 3:{
        temp = this.decimalPlaceCollapsed;
        break;
      }
    }
    this.collapseAll();
    switch (option){
      case 0:{
        this.columnKeyCollapsed = !temp;
        setTimeout(()=> {
          this.scrollToView(this.advanceATitle);
        }, 400);
        break;
      }
      case 1:{
        this.replaceKeyCollapsed = !temp;
        setTimeout(()=> {
          this.scrollToView(this.advanceBTitle);
        }, 400);
        break;
      }
      case 2:{
        this.replaceAllCollapsed = !temp;
        setTimeout(()=> {
          this.scrollToView(this.advanceCTitle);
        }, 400);
        break;
      }
      case 3:{
        this.decimalPlaceCollapsed = !temp;
        setTimeout(()=> {
          this.scrollToView(this.advanceDTitle);
        }, 400);
        break;
      }
    }
  }

  protected addShakingAnimation(targetId: string): void {
    document.getElementById(targetId)?.classList.add('animate__animated');
    document.getElementById(targetId)?.classList.add('animate__headShake');
    setTimeout(() => {
      document.getElementById(targetId)?.classList.remove('animate__headShake');
      document.getElementById(targetId)?.classList.remove('animate__headShake');
    }, 500);
  }

  protected resetReplacementChecked(
    list: IReplacement[],
    isReplacementUndefined: boolean,
    isColumnNameUndefined: boolean,
    isReplaceNameUndefined: boolean,
    isRowNameUndefined: boolean,
    isDecimalPlaceUndefined: boolean
  ): void{
    list.forEach((item: IReplacement) => {
      if(isReplacementUndefined){
        item.checked = undefined;
      }
      if(isColumnNameUndefined){
        item.columnKey?.forEach((c: IColumnName) => {
          c.checked = undefined;
        });
      }
      if(isReplaceNameUndefined){
        item.replaceKey?.forEach((r: IReplaceName) => {
          r.checked = undefined;
        });
      }
      if(isRowNameUndefined){
        item.rowKey?.forEach((r: IReplaceName) => {
          r.checked = undefined;
        });
      }
      if(isDecimalPlaceUndefined){
        item.decimalPlace?.forEach((d: IDecimalPlaces) => {
          d.checked = undefined
        })
      }
    });
  }

  protected getHeadersFromWorkSheet(ws: WorkSheet): string[]{
    return XLSX.utils.sheet_to_json(ws, {header:1, raw:false})[0] as string[];
  }

  protected getUUID(): string{
    let tempId = uuid.v4();
    while (!this.checkIdIsUnique(tempId)){
      tempId = uuid.v4();
    }
    return tempId;
  }

  protected checkIdIsUnique(id: string): boolean{
    if(this.replacements !== undefined){
      for (const replacement of this.replacements) {
        if(replacement.id === id){
          return false;
        }
        if(replacement.columnKey !== undefined && replacement.columnKey !== null){
          for (const columnKeyElement of replacement.columnKey) {
            if(columnKeyElement.id === id){
              return false;
            }
          }
        }
        if(replacement.replaceKey !== undefined && replacement.replaceKey !== null){
          for (const replaceKeyElement of replacement.replaceKey) {
            if(replaceKeyElement.id === id){
              return false;
            }
          }
        }
        if(replacement.rowKey !== undefined && replacement.rowKey !== null){
          for (const replacementElement of replacement.rowKey) {
            if(replacementElement.id === id){
              return false;
            }
          }
        }
        if(replacement.decimalPlace !== undefined && replacement.decimalPlace !== null){
          for (const replacementElement of replacement.decimalPlace) {
            if(replacementElement.id === id){
              return false;
            }
          }
        }
      }
    }
    return true;
  }

  protected resetIsEditing(replacements: IReplacement[]): void{
    replacements.forEach((r: IReplacement) => {
      r.isEditing = false;
      r.isJustCreated = false;
      r.checked = false;
      r.columnKey?.forEach((c: IColumnName) => {
        c.isEditing = false;
        c.isJustCreated = false;
      });
      r.replaceKey?.forEach((rk: IReplaceName) => {
        rk.isEditing = false;
        rk.isJustCreated = false;
      });
      r.rowKey?.forEach((row: IRowName) => {
        row.isEditing = false;
        row.isJustCreated = false;
      });
      r.decimalPlace?.forEach((d: IDecimalPlaces) => {
        d.isEditing = false;
        d.isJustCreated = false;
      })
    });
    localStorage.setItem(this.storageReplaceName, JSON.stringify(replacements));
  }

  protected rearrangeJustCreated(replacements: IReplacement[], isCloned?: boolean): IReplacement[]{
    // let cloned: IReplacement[];
    // console.warn(replacements)
    // if(isCloned){
    //   cloned = replacements.map(x => Object.assign({}, x));
    // }
    // else{
    //   cloned = replacements;
    // }
    const result: IReplacement[] = [];
    let replacementCheckedIndex = -1;
    replacements.forEach((r: IReplacement, index: number) => {
      if(r.checked){
        replacementCheckedIndex = index;
      }
      if(!r.isJustCreated){
        const cloneReplacement: IReplacement = Object.assign({}, r);
        cloneReplacement.columnKey = [];
        cloneReplacement.replaceKey = [];
        cloneReplacement.rowKey = [];
        cloneReplacement.decimalPlace = [];
        r.columnKey?.forEach((c: IColumnName, cIndex: number) => {
          if(!c.isJustCreated){
            cloneReplacement.columnKey?.push(Object.assign({}, c));
          }
        });
        r.replaceKey?.forEach((rk: IReplaceName, rkIndex: number) => {
          if(!rk.isJustCreated){
            cloneReplacement.replaceKey?.push(Object.assign({}, rk));
          }
        });
        r.rowKey?.forEach((row: IRowName, rowIndex: number) => {
          if(!row.isJustCreated){
            cloneReplacement.rowKey?.push(Object.assign({}, row));
          }
        });
        r.decimalPlace?.forEach((d: IDecimalPlaces, dIndex: number) =>{
          if(!d.isJustCreated){
            cloneReplacement.decimalPlace?.push(Object.assign({}, d));
          }
        });
        result.push(cloneReplacement);
      }
    });
    if(!isCloned){
      this.replacements = result;
      if(replacementCheckedIndex !== -1){
        this.displayReplacement = this.replacements[replacementCheckedIndex];
      }
    }
    return result;
  }

  protected calcDecimalPlace(item: IDecimalPlaces): void{
    if(item.editDecimalPlacesOption !== undefined && item.editDecimalPlacesOption.trim() !== ''){
      item.editDecimalPlacesOption = item.editDecimalPlacesOption.trim();
      const reference = item.editDecimalPlacesOption.substring(item.editDecimalPlacesOption.indexOf('.')+1);
      const zeroCharacters = reference.split('');
      const thDecimalPlace = zeroCharacters.length;
      item.calcDecimalPlaceDigit = 1;
      const offset = 10;
      for (let i = 0; i < thDecimalPlace; i++) {
        item.calcDecimalPlaceDigit *= offset;
      }
    }
  }

  protected getDecimalPlaces(qty: number): string[]{
    const list = [];
    let tempPrefix = this.prefix;
    for (let i = 0; i < qty; i++) {
      list.push(tempPrefix);
      tempPrefix += String(0);
    }
    return list;
  }

  protected countNumberOfDigits(num: number, targetDigit: string): number{
    let char: string[] = String(num).split('');
    let count = 0;
    char.forEach((c: string) => {
      if(c === targetDigit){
        count++;
      }
    });
    return count;
  }

  protected floorPrecised(num: number, precision: number): string {
    let power = Math.pow(10, precision);
    const temp = Math.floor(num * power) / power;
    return temp.toFixed(precision);
  }

  protected roundPrecised(num: number, precision: number): string {
    let power = Math.pow(10, precision);
    const temp = Math.round((num + Number.EPSILON) * power) / power;
    return temp.toFixed(precision);
  }

  protected ceilPrecised(num: number, precision: number): string {
    let power = Math.pow(10, precision);
    const temp = Math.ceil(num * power) / power;
    return temp.toFixed(precision);
  }


  protected save(event: any, item: IColumnName | IReplaceName | IRowName, index: number): void{
     if ("columnName" in item) {
       item.columnName = item.editColumnName;
     }
     if ("editColumnName" in item) {
       item.editColumnName = undefined;
     }
    item.from = item.editFrom;
    item.editFrom = undefined;
    item.to = item.editTo;
    item.editTo = undefined;
    item.isEditing = false;
    item.isJustCreated = false;
    this.addingOrderList();
    this.saveReplacementInLocalStorage(true);
    this.Toast.fire({
      icon: 'success',
      title: 'Saved!'
    });
  }

  protected decimalPlaceSave(event: any, item: IDecimalPlaces, index: number): void{
    item.columnName = item.editColumnName;
    item.editColumnName = undefined;
    this.calcDecimalPlace(item);
    item.decimalPlacesOption = item.editDecimalPlacesOption;
    item.editDecimalPlacesOption = undefined;
    item.mathMethod = item.editMathMethod;
    item.editMathMethod = undefined;
    item.isEditing = false;
    item.isJustCreated = false;
    this.addingOrderList();
    this.saveReplacementInLocalStorage(true);
    console.warn(item)
    this.Toast.fire({
      icon: 'success',
      title: 'Saved!'
    });
  }

  protected scrollToView(elementRef: ElementRef | undefined): void{
    elementRef?.nativeElement.scrollIntoView({
      behavior: 'smooth',
    });
  }

  protected expandAll(): void{
    this.columnKeyCollapsed = false;
    this.replaceKeyCollapsed = false;
    this.replaceAllCollapsed = false;
    this.decimalPlaceCollapsed = false;
  }

  protected collapseAll(): void{
    this.columnKeyCollapsed = true;
    this.replaceKeyCollapsed = true;
    this.replaceAllCollapsed = true;
    this.decimalPlaceCollapsed = true;
  }

  protected detectMobileScreen(screenWidth: any): void{
    if(screenWidth <= this.mobileWidth){
      this.preIsMobile = this.isMobile;
      this.isMobile = true;
    }
    else if(screenWidth > this.mobileWidth && screenWidth <= this.tabletsWidth){
      this.preIsMobile = this.isMobile;
      this.isMobile = true;
    }
    else{
      this.preIsMobile = this.isMobile;
      this.isDesktopDevice = true;
      this.isMobile = false;
    }
    if(this.preIsMobile !== this.isMobile){
      this.columnKeyCollapsed = this.isMobile;
      this.replaceKeyCollapsed = this.isMobile;
      this.replaceAllCollapsed = this.isMobile;
      this.decimalPlaceCollapsed = this.isMobile;
    }
  }
}
