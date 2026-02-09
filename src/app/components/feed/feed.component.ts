import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MemeService } from '../../services/meme.service';
import { Meme, UserPreferences } from '../../models/meme.model';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { PostDetailComponent } from '../post-detail/post-detail.component';
import { ComposerComponent } from '../composer/composer.component';
import { SharedButtonComponent } from '@shared/ui/button/button.component';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, FormsModule, PostDetailComponent, ComposerComponent, SharedButtonComponent],
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css']
})
export class FeedComponent implements OnInit {

  // Data Sources
  private searchTerm$ = new BehaviorSubject<string>('');
  private filterMood$ = new BehaviorSubject<string>('');
  private filterTeam$ = new BehaviorSubject<string>('');
  private filterSaved$ = new BehaviorSubject<boolean>(false);
  private filterLiked$ = new BehaviorSubject<boolean>(false);
  private sortOrder$ = new BehaviorSubject<'newest' | 'oldest'>('newest');

  // UI State
  searchTerm = '';
  filterMood = '';
  filterTeam = '';
  filterSaved = false;
  filterLiked = false;
  sortOrder: 'newest' | 'oldest' = 'newest';

  teams = ['Engineering', 'Product', 'Design', 'QA', 'HR', 'Sales', 'Marketing'];

  selectedMeme: Meme | null = null;
  isComposerOpen = false;
  editingMeme: Meme | null = null;

  displayedMemes$ = combineLatest([
    this.memeService.memes$,
    this.memeService.preferences$,
    this.searchTerm$,
    this.filterMood$,
    this.filterTeam$,
    this.filterSaved$,
    this.filterLiked$,
    this.sortOrder$
  ]).pipe(
    map(([memes, prefs, search, mood, team, savedOnly, likedOnly, sort]) => {
      let filtered = memes;

      // Filter by Saved
      if (savedOnly) {
        filtered = filtered.filter(m => prefs.savedPosts.includes(m.id));
      }

      // Filter by Liked
      if (likedOnly) {
        filtered = filtered.filter(m => prefs.likedPosts.includes(m.id));
      }

      // Filter by Mood
      if (mood) {
        filtered = filtered.filter(m => m.mood === mood);
      }

      // Filter by Team
      if (team) {
        filtered = filtered.filter(m => m.team === team);
      }

      // Filter by Search (Title + Body)
      if (search) {
        const lowerSearch = search.toLowerCase();
        filtered = filtered.filter(m =>
          (m.title && m.title.toLowerCase().includes(lowerSearch)) ||
          m.content.toLowerCase().includes(lowerSearch)
        );
      }

      // Sort
      return filtered.sort((a, b) => {
        return sort === 'newest'
          ? b.timestamp - a.timestamp
          : a.timestamp - b.timestamp;
      });
    })
  );

  constructor(public memeService: MemeService) { }

  ngOnInit(): void {
    this.memeService.memes$.subscribe(memes => {
      if (this.selectedMeme) {
        const updated = memes.find(m => m.id === this.selectedMeme!.id);
        if (updated) {
          this.selectedMeme = updated;
        }
      }
    });
  }

  onSearch(term: string) {
    this.searchTerm$.next(term);
  }

  onFilterMood(mood: string) {
    this.filterMood$.next(mood);
  }

  onFilterTeam(team: string) {
    this.filterTeam$.next(team);
  }

  toggleSavedFilter() {
    if (this.filterLiked) {
      this.filterLiked = false;
      this.filterLiked$.next(false);
    }
    this.filterSaved = !this.filterSaved;
    this.filterSaved$.next(this.filterSaved);
  }

  toggleLikedFilter() {
    if (this.filterSaved) {
      this.filterSaved = false;
      this.filterSaved$.next(false);
    }
    this.filterLiked = !this.filterLiked;
    this.filterLiked$.next(this.filterLiked);
  }

  onSortChange(order: 'newest' | 'oldest') {
    this.sortOrder = order;
    this.sortOrder$.next(order);
  }

  openMeme(meme: Meme) {
    this.selectedMeme = meme;
  }

  closeMeme() {
    this.selectedMeme = null;
  }

  openComposer(memeToEdit?: Meme) {
    this.editingMeme = memeToEdit || null;
    this.isComposerOpen = true;
  }

  closeComposer() {
    this.isComposerOpen = false;
    this.editingMeme = null;
  }

  getPreviewContent(content: string): string {
    const masked = content.replace(/\|\|.*?\|\|/g, '[SPOILER]');
    if (masked.length > 100) {
      return masked.substring(0, 100) + '...';
    }
    return masked;
  }

  getRelativeTime(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  }
}
