import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar">
      <div class="logo" routerLink="/feed">MemeApp</div>
      
      <ng-container *ngIf="authService.currentUser$ | async as currentUser; else guestControls">
        <div class="links">
          <a routerLink="/feed" routerLinkActive="active">Feed</a>
          <a routerLink="/compose" routerLinkActive="active">Compose</a>
          <a routerLink="/me" routerLinkActive="active">Profile</a>
          <a *ngIf="currentUser.role === 'admin'" routerLink="/admin/moderation" routerLinkActive="active" class="admin-link">Admin</a>
          <span class="username">👤 {{ currentUser.username }}</span>
          <button (click)="logout()" class="logout-btn">Logout</button>
        </div>
      </ng-container>

      <ng-template #guestControls>
        <div class="links">
            <a routerLink="/auth/login">Login</a>
            <a routerLink="/auth/register">Register</a>
        </div>
      </ng-template>
    </nav>
  `,
  styles: [`
    .navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 2rem;
      height: 60px;
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border-color);
      margin-bottom: 1rem;
    }
    .logo { font-weight: bold; font-size: 1.2rem; cursor: pointer; color: var(--primary-color); }
    .links { display: flex; align-items: center; gap: 1rem; }
    .links a {
      text-decoration: none;
      color: var(--text-secondary);
      font-weight: 500;
      transition: color 0.2s;
      cursor: pointer;
    }
    .links a:hover, .links a.active {
      color: var(--primary-color);
    }
    .username {
      color: var(--text-primary);
      font-weight: 600;
      padding: 0.5rem 1rem;
      background: var(--bg-primary);
      border-radius: 20px;
      border: 1px solid var(--border-color);
    }
    .admin-link { color: #e74c3c !important; }
    .logout-btn { 
      color: white;
      background: var(--danger-color);
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    .logout-btn:hover { 
      opacity: 0.8;
    }
  `]
})
export class NavbarComponent {
  constructor(public authService: AuthService, private router: Router) {
    console.log('NavbarComponent initialized');
  }

  logout() {
    console.log('Logout clicked');
    this.authService.logout();
  }
}
