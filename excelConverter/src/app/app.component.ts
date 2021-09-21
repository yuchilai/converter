import {
  Component,
  ElementRef,
  VERSION,
  ViewChild,
  HostListener,
  OnInit,
  ViewChildren,
  QueryList,
} from '@angular/core';
import { ExcelService } from './service/excel.service';
import * as XLSX from 'xlsx';
import { IInvoice, Invoice } from './invoice.model';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ErrorMsg, IErrorMsg } from './errorMsg.model';
import { Displayed, IDisplayed } from './displayed.model';
import Swal from 'sweetalert2';
import { Behavior, IBehavior } from './behavior.model';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  @ViewChild('myInput')
  myInputVariable?: ElementRef;

  @ViewChild('editArea')
  editArea?: ElementRef;

  @ViewChild('topOne')
  topOne?: ElementRef;

  @ViewChild('editLayoutList')
  editLayoutList?: ElementRef;

  @ViewChildren('layoutList') layoutList?: QueryList<ElementRef>;

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
  defaultName = 'Default Layout'

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

  constructor(private excelService: ExcelService) {}

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.cancelEditing();
    }
  }

  ngOnInit() {
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
      filedNameListFromStorage.forEach((strList) => {
        this.allFiledNameList.push(strList);
      });
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
          initial[name] = XLSX.utils.sheet_to_json(sheet);
          return initial;
        }, {});
        const dataString = JSON.stringify(jsonData);
        // document.getElementById('output').innerHTML = dataString
        //   .slice(0, 300)
        //   .concat('...');
        // this.setDownload(dataString);

        const jsonArr = JSON.parse(dataString);
        this.outputList = [];
        this.displayedList = [];
        this.errorMsg = [];
        if (workBook.SheetNames.length !== undefined) {
          for (let i = 0; i < workBook.SheetNames.length; i++) {
            this.invoices = [];
            jsonArr[workBook.SheetNames[i]].forEach((obj: any) => {
              const invoiceObj = this.invoiceKeyList.reduce((carry:any, item: any) => {
                carry[item] = undefined;
                return carry;
              }, {});

              let isObjNotEmpty = false;
              for (var key in obj) {
                this.invoiceKeyList.forEach((k) => {
                  // console.log("key: " + key + ", value: " + obj[key])
                  // console.log("k: " + k + ", value: " + invoiceObj[k]);
                  // console.log(key === k);
                  if (key === k) {
                    if (obj[key] !== undefined) {
                      invoiceObj[k] = obj[key];
                      isObjNotEmpty = true;
                    }
                  }
                });
                // console.log("key: " + key + ", value: " + obj[key])
              }
              // console.log(isObjNotEmpty)
              // console.log(invoiceObj)
              if (isObjNotEmpty) {
                this.invoices.push(invoiceObj);
              }
            });
            this.countLineNO();
            if (this.invoices.length > 0) {
              this.excelService.exportAsExcelFile(
                this.invoices,
                this.exportFileName,
                !this.isAutoDownload
              );
              this.outputList.push(this.invoices);
              if (this.isAutoDownload) {
                if (this.checkIfOutputListNotEmpty()) {
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
              msgObj.msg =
                'Sheet ' +
                (i + 1) +
                ' does not match any field names that are shown in the button of the list (File: ' +
                this.fileName +
                ')';
              msgObj.isDisplayed = true;
              this.errorMsg.push(msgObj);
              this.checkIfOutputListNotEmpty();
              const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 10000,
                timerProgressBar: true,
                didOpen: (toast) => {
                  toast.addEventListener('mouseenter', Swal.stopTimer);
                  toast.addEventListener('mouseleave', Swal.resumeTimer);
                },
              });

              Toast.fire({
                icon: 'error',
                title: 'Something went wrong! Please see the detail above!',
              });
            }
          }
        } else {
          this.invoices = [];
          jsonArr[workBook.SheetNames[0]].forEach((obj: any) => {
            const invoiceObj = this.invoiceKeyList.reduce((carry: any, item: any) => {
              carry[item] = undefined;
              return carry;
            }, {});

            let isObjNotEmpty = false;
            for (var key in obj) {
              this.invoiceKeyList.forEach((k) => {
                // console.log("key: " + key + ", value: " + obj[key])
                // console.log("k: " + k + ", value: " + invoiceObj[k]);
                // console.log(key === k);
                if (key === k) {
                  if (obj[key] !== undefined) {
                    invoiceObj[k] = obj[key];
                    isObjNotEmpty = true;
                  }
                }
              });
              // console.log("key: " + key + ", value: " + obj[key])
            }
            // console.log(isObjNotEmpty)
            // console.log(invoiceObj)
            if (isObjNotEmpty) {
              this.invoices.push(invoiceObj);
            }
          });
          this.countLineNO();
          if (this.invoices.length > 0) {
            this.excelService.exportAsExcelFile(
              this.invoices,
              this.exportFileName,
              !this.isAutoDownload
            );
            this.outputList.push(this.invoices);
            if (this.isAutoDownload) {
              if (this.checkIfOutputListNotEmpty()) {
                this.isShowDownloadBtn = true;
              }
            } else {
              if (this.checkIfOutputListNotEmpty()) {
                this.hasOutput = true;
              }
            }
            const itemObj: IDisplayed = new Displayed();
            itemObj.name = workBook.SheetNames[0];
            if (itemObj.displayList === undefined) {
              itemObj.displayList = [];
            }
            itemObj.displayList.push(this.invoices);
            this.displayedList.push(itemObj);
          } else {
            const msgObj = new ErrorMsg();
            msgObj.msg =
              'Sheet 1 does not match any field names that are shown in the botton of the list OR File: ' +
              this.fileName +
              ' does not accept';
            msgObj.isDisplayed = true;
            this.errorMsg.push(msgObj);
            this.checkIfOutputListNotEmpty();
            const Toast = Swal.mixin({
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 10000,
              timerProgressBar: true,
              didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer);
                toast.addEventListener('mouseleave', Swal.resumeTimer);
              },
            });

            Toast.fire({
              icon: 'error',
              title:
                'File: ' +
                this.fileName +
                'some of sheets do not convert successfully or something went wrong! Please see the deatil above!',
            });
          }
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

  checkIfOutputListNotEmpty(): boolean {
    if (this.outputList.length > 0) {
      return true;
    } else {
      return false;
    }
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

  deletObjFromList(i: number, item: string[]): void {
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
          this.Toast.fire({
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
            this.selectedIndex = 0;
            const temp: string[] = this.createADefaultKeyObj();
            this.allFiledNameList = [];
            this.allFiledNameList.push(temp);
            this.invoiceKeyList = temp;
            this.isAutoDownload = true;
            this.tempName = this.exportFileName;
            this.isExcelOnly = true;
            this.isSportMode = true;
            this.errorMsg = [];
            this.listNames = [];
            Swal.fire({
              title: 'Done!',
              html: 'Everything has been reset. <br> Thank you for your patience!',
              icon: 'success',
              didClose: () => window.scrollTo({
                top: 0,
                left: 0,
                behavior: 'smooth'
              })
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
        this.listName = this.listName.trim();
        if(this.listName !== ''){
          this.listNames[this.selectedIndex] = this.listName.trim();
          localStorage.setItem(this.storageListNames, JSON.stringify(this.listNames));
          this.listName = undefined;
        }
      }
      this.Toast.fire({
        icon: 'success',
        title: 'Saved!',
      });
      this.sync();
    }
    else{
      this.Toast.fire({
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
    const invoiceKeys: string[] = Object.keys(invoice);
    return invoiceKeys;
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

  dowloadTheFile(index: number): void {
    // this.excelService.exportAsExcelFile(item, this.exportFileName, false);
    this.excelService.exportAsExcelFile(
      this.outputList[index],
      this.exportFileName,
      false
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

  addShakingAnimation(targetId: string): void {
    document.getElementById(targetId)?.classList.add('animate__animated');
    document.getElementById(targetId)?.classList.add('animate__headShake');
    setTimeout(() => {
      document.getElementById(targetId)?.classList.remove('animate__headShake');
      document.getElementById(targetId)?.classList.remove('animate__headShake');
    }, 500);
  }

  scroll(el: HTMLElement) {
    el.scrollIntoView();
  }
  // scroll() {}
}
