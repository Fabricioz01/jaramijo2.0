import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, HeaderComponent, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  user: any = null;
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    
    const userId = this.getUserId(currentUser);
    if (userId) {
      this.userService.getById(userId).subscribe({
        next: (resp) => {
          // Mapear roleIds a roles para compatibilidad con el HTML
          const user = resp.data;
          if (user && Array.isArray(user.roleIds)) {
            (user as any).roles = user.roleIds;
          }
          this.user = user;
        },
        error: (err) => {
          console.error(
            '[ProfileComponent] Error al obtener usuario por id:',
            err
          );
          this.user = null;
        },
      });
    } else {
      console.warn(
        '[ProfileComponent] No se encontró usuario logeado en AuthService.'
      );
      this.user = null;
    }
  }

  /**
   * Obtiene el id del usuario logeado, soportando tanto _id como id
   */
  private getUserId(user: any): string | undefined {
    if (!user) return undefined;
    if (typeof user._id === 'string') return user._id;
    if (typeof user.id === 'string') return user.id;
    return undefined;
  }

  getInitials(name: string | undefined): string {
    if (!name) return '';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  getDireccionName(): string {
    if (this.user?.direccionId && typeof this.user.direccionId === 'object') {
      return this.user.direccionId.name;
    }
    if (
      this.user?.departamento?.direccionId &&
      typeof this.user.departamento.direccionId === 'object'
    ) {
      return this.user.departamento.direccionId.name;
    }
    return 'No asignada';
  }

  getDepartamentoName(): string {
    if (this.user?.departamento?.name) return this.user.departamento.name;
    if (
      this.user?.departamentoId &&
      typeof this.user.departamentoId === 'object'
    )
      return this.user.departamentoId.name;
    return 'No asignado';
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
