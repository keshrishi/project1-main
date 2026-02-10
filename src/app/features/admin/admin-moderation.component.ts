import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MemeService } from '../../services/meme.service';
import { Meme } from '../../models/meme.model';
import { map, BehaviorSubject, combineLatest } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-moderation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-moderation.component.html',
  styleUrls: ['./admin-moderation.component.css']
})
export class AdminModerationComponent {

  showDeletedSubject = new BehaviorSubject<boolean>(false);
  showFlaggedSubject = new BehaviorSubject<boolean>(false);

  displayedMemes$ = combineLatest([
    this.memeService.memes$,
    this.showDeletedSubject,
    this.showFlaggedSubject
  ]).pipe(
    map(([memes, showDeleted, showFlagged]) => {
      let result = memes;

      if (showFlagged) {
        result = result.filter(m => m.flagged || (m.flags && m.flags.length > 0));
      }

      if (!showDeleted) {
        result = result.filter(m => !m.deleted);
      }

      return result;
    })
  );

  constructor(public memeService: MemeService, private router: Router) { }

  toggleDeleted(event: any) {
    this.showDeletedSubject.next(event.target.checked);
  }

  toggleFlagged(event: any) {
    this.showFlaggedSubject.next(event.target.checked);
  }

  getPreviewContent(content: string): string { return content.length > 50 ? content.substring(0, 50) + '...' : content; }

  softDelete(meme: Meme) {
    if (confirm('Are you sure you want to soft delete this post?')) {
      this.memeService.softDeleteMeme(meme.id);
    }
  }

  restore(meme: Meme) {
    this.memeService.restoreMeme(meme.id);
  }

  viewMeme(meme: Meme) {
    this.router.navigate(['/post', meme.id]);
  }

  editMeme(meme: Meme) {
    this.router.navigate(['/edit', meme.id]);
  }

  resolveFlag(meme: Meme, index: number) {
    this.memeService.resolveFlag(meme.id, index);
  }

  unflagMeme(meme: Meme) {
    if (confirm('Clear all flags and unflag this post?')) {
      this.memeService.unflagMeme(meme.id);
    }
  }
}
