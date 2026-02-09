import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MemeService } from '../../services/meme.service';
import { Router, RouterModule } from '@angular/router';
import { map } from 'rxjs';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <div class="profile-container" *ngIf="memeService.currentUser$ | async as user">
      <div class="profile-header">
        <div class="avatar-large">{{ user.username.charAt(0) }}</div>
        <h1>{{ user.username }}</h1>
        <p>{{ user.email }}</p>
        <span class="role-badge">{{ user.role }}</span>
      </div>

      <div class="profile-tabs">
        <a routerLink="saved" routerLinkActive="active">Saved</a>
        <a routerLink="liked" routerLinkActive="active">Liked</a>
      </div>

      <router-outlet></router-outlet>
    </div>
  `,
    styles: [`
    .profile-container { max-width: 800px; margin: 2rem auto; padding: 1rem; }
    .profile-header { text-align: center; margin-bottom: 2rem; }
    .avatar-large { 
        width: 80px; height: 80px; border-radius: 50%; background: var(--primary-color); 
        color: white; display: flex; align-items: center; justify-content: center; 
        font-size: 2rem; margin: 0 auto 1rem;
    }
    .role-badge { background: #333; color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; }
    .profile-tabs { display: flex; gap: 1rem; border-bottom: 1px solid var(--border-color); margin-bottom: 1rem; }
    .profile-tabs a { 
        padding: 0.5rem 1rem; text-decoration: none; color: var(--text-secondary); 
        border-bottom: 2px solid transparent;
    }
    .profile-tabs a.active { border-bottom-color: var(--primary-color); color: var(--text-primary); }
  `]
})
export class ProfileComponent {
    constructor(public memeService: MemeService) { }
}
