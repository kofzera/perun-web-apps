import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  Application,
  ApplicationFormItemData,
  ApplicationsOrderColumn,
  AppState,
  AttributeDefinition,
  Group,
  Member,
  RichApplication,
  Vo,
} from '@perun-web-apps/perun/openapi';
import {
  downloadData,
  getDataForExport,
  getDefaultDialogConfig,
  parseFullName,
  TABLE_ITEMS_COUNT_OPTIONS,
  TableWrapperComponent,
} from '@perun-web-apps/perun/utils';
import { MatSort } from '@angular/material/sort';
import {
  DynamicDataSource,
  DynamicPaginatingService,
  GuiAuthResolver,
} from '@perun-web-apps/perun/services';
import { merge, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { TableConfigService } from '@perun-web-apps/config/table-config';
import { formatDate } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ExportDataDialogComponent } from '@perun-web-apps/perun/dialogs';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'perun-web-apps-applications-dynamic-list',
  templateUrl: './applications-dynamic-list.component.html',
  styleUrls: ['./applications-dynamic-list.component.css'],
})
export class ApplicationsDynamicListComponent implements OnInit, OnChanges, AfterViewInit {
  @ViewChild(TableWrapperComponent, { static: true }) child: TableWrapperComponent;

  @ViewChild(MatSort) sort: MatSort;
  @Input() displayedColumns: string[] = [];
  @Input() fedColumnsFriendly: string[] = [];
  @Input() tableId: string;
  @Input() disableRouting = false;
  @Input() searchString = '';
  @Input() group: Group;
  @Input() member: Member;
  @Input() vo: Vo;
  @Input() includeGroupApps: boolean;
  @Input() states: AppState[];
  @Input() dateTo: Date = new Date();
  @Input() dateFrom: Date = this.yearAgo();
  @Input() fedAttrs: AttributeDefinition[] = [];
  @Input() fedAttrNames: string[] = [];
  @Input() refreshTable = false;
  @Output() loading$: EventEmitter<Observable<boolean>> = new EventEmitter<Observable<boolean>>();
  @Output() selectedApplications = new EventEmitter<Application[]>();

  parsedColumns: string[] = [];
  dataSource: DynamicDataSource<Application>;
  pageSizeOptions = TABLE_ITEMS_COUNT_OPTIONS;
  selection = new SelectionModel<Application>(true, []);
  fedColumnsDisplay = [];

  constructor(
    private authResolver: GuiAuthResolver,
    private tableConfigService: TableConfigService,
    private dynamicPaginatingService: DynamicPaginatingService,
    private dialog: MatDialog
  ) {}

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => (this.child.paginator.pageIndex = 0));
    merge(this.sort.sortChange, this.child.paginator.page)
      .pipe(tap(() => this.loadApplicationsPage()))
      .subscribe();
  }

  ngOnInit(): void {
    if (!this.authResolver.isPerunAdminOrObserver()) {
      this.displayedColumns = this.displayedColumns.filter((column) => column !== 'id');
    }

    this.dataSource = new DynamicDataSource<Application>(
      this.dynamicPaginatingService,
      this.authResolver
    );

    const dateTo = this.dateTo ?? new Date();

    this.dataSource.loadApplications(
      this.tableConfigService.getTablePageSize(this.tableId),
      0,
      'DESCENDING',
      this.getSortDataColumn(),
      this.searchString,
      this.includeGroupApps,
      this.states,
      this.dateToString(this.dateFrom),
      this.dateToString(dateTo),
      this.member?.userId ?? null,
      this.group?.id ?? null,
      this.getVoId()
    );
    this.loading$.emit(this.dataSource.loading$);

    this.dataSource.loading$.subscribe((val) => {
      if (val || !this.displayedColumns.includes('fedInfo')) return;

      this.displayedColumns = this.displayedColumns.filter((v) => !this.parsedColumns.includes(v));
      this.parsedColumns = [];

      const data = this.dataSource.getData()[0] as RichApplication;
      if (data) {
        this.parseColumns(data.formData);
      }
    });

    this.selection.changed.subscribe((change) => {
      this.selectedApplications.emit(change.source.selected);
    });
  }

  ngOnChanges(): void {
    this.fedColumnsDisplay = [];
    this.fedColumnsFriendly.forEach((name) =>
      this.fedColumnsDisplay.push(
        this.fedAttrs.find((attr) => attr.friendlyName === name)?.displayName || ''
      )
    );

    this.refreshTable = false;
    if (this.dataSource) {
      this.child.paginator.pageIndex = 0;
      this.loadApplicationsPage();
    }
    this.selection.clear();
  }

  isAllSelected(): boolean {
    return this.selection.selected.length === this.dataSource.getData().length;
  }

  masterToggle(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.dataSource.getData().forEach((row) => this.selection.select(row));
    }
  }

  loadApplicationsPage(): void {
    const sortDirection = this.sort.direction === 'asc' ? 'ASCENDING' : 'DESCENDING';
    const dateTo = this.dateTo ?? new Date();
    this.dataSource.loadApplications(
      this.child.paginator.pageSize,
      this.child.paginator.pageIndex,
      sortDirection,
      this.getSortDataColumn(),
      this.searchString,
      this.includeGroupApps,
      this.states,
      this.dateToString(this.dateFrom),
      this.dateToString(dateTo),
      this.member?.userId ?? null,
      this.group?.id ?? null,
      this.getVoId(),
      true
    );
  }

  exportDisplayedData(format: string): void {
    downloadData(
      getDataForExport(
        this.dataSource.getData(),
        this.displayedColumns,
        this.getExportDataForColumn.bind(this) as (data: Application, column: string) => string
      ),
      format
    );
  }

  exportAllData(format: string): void {
    const sortDirection = this.sort.direction === 'asc' ? 'ASCENDING' : 'DESCENDING';

    const config = getDefaultDialogConfig();
    config.width = '300px';
    const exportLoading = this.dialog.open(ExportDataDialogComponent, config);

    const dateTo = this.dateTo ?? new Date();

    this.dataSource
      .getAllApplications(
        this.child.paginator.length,
        sortDirection,
        this.getSortDataColumn(),
        this.searchString,
        this.includeGroupApps,
        this.states,
        this.dateToString(this.dateFrom),
        this.dateToString(dateTo),
        this.member?.userId ?? null,
        this.group?.id ?? null,
        this.getVoId(),
        true
      )
      .subscribe((response) => {
        exportLoading.close();
        downloadData(
          getDataForExport(
            response,
            this.displayedColumns,
            this.getExportDataForColumn.bind(this) as (data: Application, column: string) => string
          ),
          format
        );
      });
  }

  getExportDataForColumn(data: Application, column: string): string {
    switch (column) {
      case 'id':
        return data.id.toString();
      case 'voId':
        return data.vo.id.toString();
      case 'voName':
        return data.vo.name;
      case 'groupId':
        return data.group?.id.toString() ?? '';
      case 'groupName':
        return data.group?.name ?? '';
      case 'type':
        return data.type;
      case 'fedInfo':
        return data.fedInfo ? this.deescapeMapEscapings(data.fedInfo) : '';
      case 'formData':
        return this.stringify((data as RichApplication).formData);
      case 'state':
        return data.state;
      case 'extSourceName':
        return data.extSourceName;
      case 'extSourceType':
        return data.extSourceType;
      case 'user':
        return data.user ? parseFullName(data.user) : '';
      case 'createdBy':
        return data.createdBy;
      case 'createdAt':
        return data.createdAt;
      case 'modifiedBy':
        return data.modifiedBy;
      case 'modifiedAt':
        return data.modifiedAt;
      default:
        return this.getFedValue(data.fedInfo, column);
    }
  }

  getSortDataColumn(): ApplicationsOrderColumn {
    if (!this.sort) {
      return ApplicationsOrderColumn.DATE_CREATED;
    }
    switch (this.sort.active) {
      case 'id':
        return ApplicationsOrderColumn.ID;
      case 'createdAt':
        return ApplicationsOrderColumn.DATE_CREATED;
      case 'type':
        return ApplicationsOrderColumn.TYPE;
      case 'state':
        return ApplicationsOrderColumn.STATE;
      case 'user':
        return ApplicationsOrderColumn.SUBMITTER;
      case 'groupName':
        return ApplicationsOrderColumn.GROUP_NAME;
      case 'modifiedBy':
        return ApplicationsOrderColumn.MODIFIED_BY;
      default:
        return ApplicationsOrderColumn.DATE_CREATED;
    }
  }

  getFriendlyName(name: string): string {
    const index = name.lastIndexOf('/CN=');
    if (index !== -1) {
      const string = name.slice(index + 4, name.length).replace('/unstructuredName=', ' ');
      if (string.lastIndexOf('\\') !== -1) {
        return name.slice(name.lastIndexOf('=') + 1, name.length);
      }
      return string;
    }
    return name;
  }

  yearAgo(): Date {
    const newDate = new Date();
    newDate.setDate(newDate.getDate() - 365);
    return newDate;
  }

  dateToString(date: Date): string {
    return formatDate(date, 'yyyy-MM-dd', 'en-GB');
  }

  getVoId(): number {
    if (this.vo) {
      return this.vo.id;
    }
    if (this.group) {
      return this.group.voId;
    }
    if (this.member) {
      return this.member.voId;
    }
  }

  stringify(obj: object): string {
    const removeNullUndefined = (toFilter: object): object =>
      Object.entries(toFilter).reduce(
        (a, [k, v]) =>
          a[k] instanceof Object
            ? (a[k] = removeNullUndefined(a[k] as object))
            : v == null || v === 'null' || (v as string).length === 0
            ? a
            : ((a[k] = v as string), a),
        {}
      );

    let str = JSON.stringify(removeNullUndefined(obj));
    str = str.replace('{', '[');
    str = str.replace('}', ']');
    return str;
  }

  getFormDataString(data: ApplicationFormItemData): string {
    return this.stringify(data.formItem);
  }

  parseColumns(array: Array<ApplicationFormItemData>): void {
    array.forEach((val) => {
      if (!this.displayedColumns.includes(val.shortname)) {
        this.displayedColumns.push(val.shortname);
      }
      if (!this.parsedColumns.includes(val.shortname)) {
        this.parsedColumns.push(val.shortname);
      }
    });
  }

  getValue(array: Array<ApplicationFormItemData>, colName: string): string {
    const filter = array.filter((value) => value.shortname === colName);
    if (filter.length === 0) {
      return '';
    }
    return filter[0].value ?? filter[0].prefilledValue;
  }

  getFedValue(fedInfo: string, colName: string): string {
    // looking for values between {,FED_INFO_ATTR_NAME:}
    if (fedInfo === null || fedInfo.length === 0) {
      return '';
    }

    let values: string[] = [];
    if (fedInfo.startsWith(colName + ':')) {
      values = fedInfo.split(colName + ':');
    } else {
      values = fedInfo.split(',' + colName + ':');
    }
    if (values.length < 2) {
      return '';
    }
    // fedInfo should always end with comma - not escaped one though
    values[1] = values[1].replace(/\\,/gi, '#ESCAPED_COMMA');
    values = values[1].split(',');
    values[0] = values[0].replace('#ESCAPED_COMMA', '\\,');
    return this.deescapeMapEscapings(values[0]);
  }

  // Fedinfo characters that are being escaped: '\', ':' and ','
  deescapeMapEscapings(value: string): string {
    let newValue = value.replace(/\\:/gi, ':');
    newValue = newValue.replace(/\\,/gi, ',');
    newValue = newValue.replace(/\\\\/gi, '\\');
    return newValue;
  }
}