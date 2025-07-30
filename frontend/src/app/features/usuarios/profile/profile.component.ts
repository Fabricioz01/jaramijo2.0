import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { AuthService } from '../../../core/services/auth.service';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, HeaderComponent, ReactiveFormsModule],
  template: `
    <app-header></app-header>
    <div class="container-fluid p-4">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="bi bi-person me-2"></i>Mi Perfil
              </h5>
            </div>
            <div class="card-body">
              <div class="text-center mb-3">
                <i class="bi bi-person-circle" style="font-size: 4rem; color: #6c757d;"></i>
              </div>
              <div class="mb-2">
                <strong>Nombre:</strong> <span class="ms-2">{{ user?.name }}</span>
              </div>
              <div class="mb-2">
                <strong>Email:</strong> <span class="ms-2">{{ user?.email }}</span>
              </div>
              <div class="mb-2">
                <strong>Departamento:</strong>
                <span class="ms-2">{{ user?.departamento?.name || user?.departamentoId?.name || 'No asignado' }}</span>
              </div>
              <div class="mb-2">
                <strong>Roles:</strong>
                <span *ngIf="user?.roles?.length; else noRol">
                  <span *ngFor="let role of user.roles" class="badge bg-primary me-1">
                    {{ role?.name || role }}
                  </span>
                </span>
                <ng-template #noRol>Sin rol asignado</ng-template>
              </div>
              <div class="mb-2">
                <strong>Fecha de Registro:</strong>
                <small class="text-muted d-block">{{ user?.createdAt | date : 'dd/MM/yyyy' }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  user: any = null;
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.user = user;
    });
  }


  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
