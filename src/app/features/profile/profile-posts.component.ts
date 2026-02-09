import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MemeService } from '../../services/meme.service';
import { Router } from '@angular/router';
import { combineLatest, map } from 'rxjs';

@Component({
    selector: 'app-profile-posts',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="meme-list">
      <div *ngFor="let meme of displayedMemes$ | async" class="meme-item" (click)="openMeme(meme.id)">
        <h3>{{ meme.title || 'Untitled' }}</h3>
        <p>{{ getPreviewContent(meme.content) }}</p>
        <div class="meta">
            <span>{{ meme.mood }}</span>
            <span>{{ meme.team }}</span>
        </div>
      </div>
       <div *ngIf="(displayedMemes$ | async)?.length === 0" class="empty-state">
          No posts found.
      </div>
    </div>
  `,
    styles: [`
    .meme-item { 
        padding: 1rem; border: 1px solid var(--border-color); margin-bottom: 1rem; 
        border-radius: 8px; cursor: pointer; transition: background 0.2s;
    }
    .meme-item:hover { background: var(--bg-secondary); }
    .meta { display: flex; gap: 1rem; font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.5rem; }
    .empty-state { text-align: center; color: var(--text-secondary); padding: 2rem; }
  `]
})
export class SavedPostsComponent {
    displayedMemes$ = combineLatest([this.memeService.memes$, this.memeService.preferences$]).pipe(
        map(([memes, prefs]) => memes.filter(m => prefs.savedPosts.includes(m.id)))
    );

    constructor(public memeService: MemeService, private router: Router) { }

    openMeme(id: string) { this.router.navigate(['/post', id]); }
    getPreviewContent(content: string): string { return content.length > 100 ? content.substring(0, 100) + '...' : content; }
}

@Component({
    selector: 'app-profile-liked',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="meme-list">
      <div *ngFor="let meme of displayedMemes$ | async" class="meme-item" (click)="openMeme(meme.id)">
        <h3>{{ meme.title || 'Untitled' }}</h3>
        <p>{{ getPreviewContent(meme.content) }}</p>
        <div class="meta">
            <span>{{ meme.mood }}</span>
            <span>{{ meme.team }}</span>
        </div>
      </div>
       <div *ngIf="(displayedMemes$ | async)?.length === 0" class="empty-state">
          No posts found.
      </div>
    </div>
  `,
    styles: [`
    .meme-item { 
        padding: 1rem; border: 1px solid var(--border-color); margin-bottom: 1rem; 
        border-radius: 8px; cursor: pointer; transition: background 0.2s;
    }
    .meme-item:hover { background: var(--bg-secondary); }
    .meta { display: flex; gap: 1rem; font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.5rem; }
    .empty-state { text-align: center; color: var(--text-secondary); padding: 2rem; }
  `]
})
export class LikedPostsComponent {
    displayedMemes$ = combineLatest([this.memeService.memes$, this.memeService.preferences$]).pipe(
        map(([memes, prefs]) => memes.filter(m => prefs.likedPosts.includes(m.id)))
    );

    constructor(public memeService: MemeService, private router: Router) { }

    openMeme(id: string) { this.router.navigate(['/post', id]); }
    getPreviewContent(content: string): string { return content.length > 100 ? content.substring(0, 100) + '...' : content; }
}
