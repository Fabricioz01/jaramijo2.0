import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AlertsComponent } from './shared/components/alerts/alerts.component';
import { PermissionSyncService } from './core/services/permission-sync.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AlertsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'frontend';
  
  constructor(private permissionSyncService: PermissionSyncService) {}
  
  ngOnInit(): void {
    // El servicio se inicializa automáticamente y empieza el polling
  }
}
