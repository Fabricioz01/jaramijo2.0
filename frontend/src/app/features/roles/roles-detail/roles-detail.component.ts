import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { ConfirmModalComponent } from '../../../shared/components/alerts/confirm-modal.component';
import { RoleService } from '../../../core/services/role.service';
import { AlertService } from '../../../core/services/alert.service';
import { AuthService } from '../../../core/services/auth.service';
import { Role, Permission } from '../../../core/models';

type RoleWithPermissions = Role & { permissionIds: Permission[] };

@Component({
  selector: 'app-roles-detail',
  standalone: true,
  imports: [CommonModule, HeaderComponent, ConfirmModalComponent],
  templateUrl: './roles-detail.component.html',
  styleUrls: ['./roles-detail.component.scss'],
})
export class RolesDetailComponent implements OnInit {
  role: RoleWithPermissions | null = null;
  loading = false;
  roleId: string | null = null;
  showDeleteModal = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roleService: RoleService,
    private alertService: AlertService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.roleId = this.route.snapshot.paramMap.get('id');
    if (this.roleId) this.getRole();
  }

  getRole(): void {
    if (!this.roleId) return;
    this.loading = true;
    this.roleService.getById(this.roleId).subscribe({
      next: (res) => {
        this.role = res.data as RoleWithPermissions;
        this.loading = false;
      },
      error: () => {
        this.alertService.error('Error al cargar rol');
        this.loading = false;
      },
    });
  }

  getPermissionDisplay(p: Permission): string {
    return `${p.action} ${p.resource}`.replace(/^\w/, (c) => c.toUpperCase());
  }

  goBack(): void {
    this.router.navigate(['/roles']);
  }
  goToEdit(): void {
    if (this.roleId) this.router.navigate(['/roles', this.roleId, 'editar']);
  }

  showDeleteConfirm(): void {
    this.showDeleteModal = true;
  }
  confirmDeleteRole(): void {
    if (!this.roleId) return;
    this.roleService.delete(this.roleId).subscribe({
      next: () => {
        this.alertService.success('Rol eliminado exitosamente');
        this.showDeleteModal = false;
        this.goBack();
      },
      error: () => {
        this.alertService.error('Error al eliminar rol');
        this.showDeleteModal = false;
      },
    });
  }
  cancelDeleteRole(): void {
    this.showDeleteModal = false;
  }

  canEdit(): boolean {
    return this.authService.canAccessAction('roles', 'update');
  }
  canDelete(): boolean {
    return this.authService.canAccessAction('roles', 'delete');
  }
}
