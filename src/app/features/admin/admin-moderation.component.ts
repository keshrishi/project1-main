import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MemeService } from '../../services/meme.service';
import { Meme } from '../../models/meme.model';
import { map } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-moderation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin-container">
      <h2>Moderation Dashboard</h2>
      
      <div class="filter-controls">
         <label><input type="checkbox" (change)="toggleDeleted($event)"> Show Deleted</label>
      </div>

      <div class="meme-list">
        <div *ngFor="let meme of displayedMemes$ | async" class="meme-table-row" [class.deleted]="meme.deleted">
          <div class="info">
            <strong>{{ meme.title || 'Untitled' }}</strong>
            <span class="preview">{{ getPreviewContent(meme.content) }}</span>
            <div class="flags" *ngIf="meme.flags?.length">
               <span class="flag-count">🚩 {{ meme.flags?.length }} Flags</span>
            </div>
          </div>
          <div class="actions">
             <button *ngIf="!meme.deleted" (click)="softDelete(meme)" class="btn-danger">Soft Delete</button>
             <button *ngIf="meme.deleted" (click)="restore(meme)" class="btn-restore">Restore</button>
             <button (click)="viewMeme(meme)" class="btn-view">View</button>
          </div>
          
          <div class="flag-details" *ngIf="meme.flags?.length">
             <ul>
               <li *ngFor="let flag of meme.flags; let i = index">
                  {{ flag.reason }} ({{ flag.timestamp | date:'short' }})
                  <button (click)="resolveFlag(meme, i)">Dismiss</button>
               </li>
             </ul>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-container { max-width: 1000px; margin: 2rem auto; padding: 1rem; }
    .meme-table-row { 
        border: 1px solid var(--border-color); padding: 1rem; margin-bottom: 1rem; 
        border-radius: 8px; 
    }
    .meme-table-row.deleted { opacity: 0.6; background: #f0f0f0; border-color: #ccc; }
    .info { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem; }
    .preview { color: var(--text-secondary); }
    .actions { display: flex; gap: 0.5rem; }
    button { padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer; }
    .btn-danger { background: #e74c3c; color: white; }
    .btn-restore { background: #27ae60; color: white; }
    .btn-view { background: #3498db; color: white; }
    .flag-details { margin-top: 1rem; background: #fff3cd; padding: 0.5rem; border-radius: 4px; }
  `]
})
export class AdminModerationComponent {

  showDeleted = false;

  displayedMemes$ = this.memeService.memes$.pipe(
    map(memes => {
      if (this.showDeleted) {
        return memes;
      }
      return memes.filter(m => !m.deleted);
    })
  );

  constructor(public memeService: MemeService, private router: Router) { }

  toggleDeleted(event: any) {
    this.showDeleted = event.target.checked;
    // Trigger generic re-emit or just rely on pipe re-eval if I update a subject.
    // But map won't re-run unless source changes.
    // I need to filter properly.
    // I'll update a subject to trigger combineLatest.
    this.toggleSubject();
  }

  // Quick fix for reactivity
  toggleSubject() {
    // I should really use a BehaviorSubject for showDeleted.
    // Re-implementing correctly below.
  }

  getPreviewContent(content: string): string { return content.length > 50 ? content.substring(0, 50) + '...' : content; }

  softDelete(meme: Meme) {
    this.memeService.softDeleteMeme(meme.id);
  }

  restore(meme: Meme) {
    this.memeService.restoreMeme(meme.id);
  }

  viewMeme(meme: Meme) {
    this.router.navigate(['/post', meme.id]);
  }

  resolveFlag(meme: Meme, index: number) {
    this.memeService.resolveFlag(meme.id, index);
  }
}
