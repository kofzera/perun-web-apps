import { Component, OnInit } from '@angular/core';
import { SideMenuService } from '../../../core/services/common/side-menu.service';
import { ActivatedRoute } from '@angular/router';
import { SideMenuItemService } from '../../../shared/side-menu/side-menu-item.service';
import { fadeIn } from '@perun-web-apps/perun/animations';
import { Group, GroupsManagerService, Vo, VosManagerService } from '@perun-web-apps/perun/openapi';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { MatDialog } from '@angular/material/dialog';
import {
  EditFacilityResourceGroupVoDialogComponent,
  EditFacilityResourceGroupVoDialogOptions
} from '../../../shared/components/dialogs/edit-facility-resource-group-vo-dialog/edit-facility-resource-group-vo-dialog.component';

@Component({
  selector: 'app-group-detail-page',
  templateUrl: './group-detail-page.component.html',
  styleUrls: ['./group-detail-page.component.scss'],
  animations: [
    fadeIn
  ]
})
export class GroupDetailPageComponent implements OnInit {

  constructor(
    private sideMenuService: SideMenuService,
    private voService: VosManagerService,
    private route: ActivatedRoute,
    private sideMenuItemService: SideMenuItemService,
    private groupService: GroupsManagerService,
    private dialog: MatDialog
  ) {
  }

  vo: Vo;
  group: Group;

  ngOnInit() {
    this.route.params.subscribe(params => {
      const voId = params['voId'];
      const groupId = params['groupId'];

      this.voService.getVoById(voId).subscribe(vo => {
        this.vo = vo;
        this.groupService.getGroupById(groupId).subscribe(group => {
          this.group = group;
          const voSideMenuItem = this.sideMenuItemService.parseVo(vo);
          const groupSideMenuItem = this.sideMenuItemService.parseGroup(group);

          this.sideMenuService.setAccessMenuItems([voSideMenuItem, groupSideMenuItem]);
        });
      });
    });
  }

  editGroup() {
    const config = getDefaultDialogConfig();
    config.width = '450px';
    config.data = {
      theme: 'group-theme',
      group: this.group,
      dialogType: EditFacilityResourceGroupVoDialogOptions.GROUP
    };
    const dialogRef = this.dialog.open(EditFacilityResourceGroupVoDialogComponent, config);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.ngOnInit();
      }
    });
  }
}
