import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MemeService } from '../../services/meme.service';
import { Meme } from '../../models/meme.model';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { SharedButtonComponent } from '@shared/ui/button/button.component';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedButtonComponent],
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css']
})
export class FeedComponent implements OnInit {
  // Filters
  searchTerm = '';
  filterMood = '';
  filterTeam = '';
  filterSaved = false;
  filterLiked = false;
  sortOrder: 'newest' | 'oldest' = 'newest';

  // State Subjects for Reactivity
  private searchTerm$ = new BehaviorSubject<string>('');
  private filterMood$ = new BehaviorSubject<string>('');
  private filterTeam$ = new BehaviorSubject<string>('');
  private filterSaved$ = new BehaviorSubject<boolean>(false);
  private filterLiked$ = new BehaviorSubject<boolean>(false);
  private sortOrder$ = new BehaviorSubject<'newest' | 'oldest'>('newest');

  // Derived Stream
  displayedMemes$ = combineLatest([
    this.memeService.memes$,
    this.searchTerm$,
    this.filterMood$,
    this.filterTeam$,
    this.filterSaved$,
    this.filterLiked$,
    this.sortOrder$,
    this.memeService.preferences$
  ]).pipe(
    map(([memes, term, mood, team, saved, liked, sort, prefs]) => {
      // Filter out deleted posts immediately
      let filtered = memes.filter(m => !m.deleted);

      // Filter by Team
      if (team) {
        filtered = filtered.filter(m => m.team === team);
      }

      // Filter by Mood
      if (mood) {
        filtered = filtered.filter(m => m.mood === mood);
      }

      // Filter by Search (Title + Content)
      if (term) {
        const lowerTerm = term.toLowerCase();
        filtered = filtered.filter(m =>
          (m.title && m.title.toLowerCase().includes(lowerTerm)) ||
          m.content.toLowerCase().includes(lowerTerm)
        );
      }

      // Filter by Saved
      if (saved) {
        filtered = filtered.filter(m => prefs.savedPosts.includes(m.id));
      }

      // Filter by Liked
      if (liked) {
        filtered = filtered.filter(m => prefs.likedPosts.includes(m.id));
      }

      // Sort
      return filtered.sort((a, b) => {
        return sort === 'newest' ? b.timestamp - a.timestamp : a.timestamp - b.timestamp;
      });
    })
  );

  constructor(
    public memeService: MemeService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Sync URL params to State
    this.route.queryParams.subscribe(params => {
      this.searchTerm = params['q'] || '';
      this.filterMood = params['mood'] || '';
      this.filterTeam = params['team'] || '';
      this.filterSaved = params['saved'] === 'true';
      this.filterLiked = params['liked'] === 'true';
      this.sortOrder = params['sort'] || 'newest';

      // Update subjects to trigger pipe
      this.searchTerm$.next(this.searchTerm);
      this.filterMood$.next(this.filterMood);
      this.filterTeam$.next(this.filterTeam);
      this.filterSaved$.next(this.filterSaved);
      this.filterLiked$.next(this.filterLiked);
      this.sortOrder$.next(this.sortOrder);
    });

    // Refresh memes on load
    this.memeService.loadMemes();
  }

  updateParams() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        q: this.searchTerm || null,
        mood: this.filterMood || null,
        team: this.filterTeam || null,
        saved: this.filterSaved || null,
        liked: this.filterLiked || null,
        sort: this.sortOrder
      },
      queryParamsHandling: 'merge'
    });
  }

  onSearch(term: string) {
    this.searchTerm = term;
    this.updateParams();
  }

  onFilterMood(mood: string) {
    this.filterMood = mood;
    this.updateParams();
  }

  onFilterTeam(team: string) {
    this.filterTeam = team;
    this.updateParams();
  }

  toggleSavedFilter() {
    if (this.filterLiked && !this.filterSaved) {
      this.filterLiked = false;
    }
    this.filterSaved = !this.filterSaved;
    this.updateParams();
  }

  toggleLikedFilter() {
    if (this.filterSaved && !this.filterLiked) {
      this.filterSaved = false;
    }
    this.filterLiked = !this.filterLiked;
    this.updateParams();
  }

  onSortChange(order: 'newest' | 'oldest') {
    this.sortOrder = order;
    this.updateParams();
  }

  openMeme(meme: Meme) {
    this.router.navigate(['/post', meme.id]);
  }

  openComposer(memeToEdit?: Meme) {
    if (memeToEdit) {
      this.router.navigate(['/edit', memeToEdit.id]);
    } else {
      this.router.navigate(['/compose']);
    }
  }

  get teams(): string[] {
    return ['Engineering', 'Product', 'Design', 'QA', 'HR', 'Sales', 'Marketing'];
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

  getPreviewContent(content: string): string {
    return content.length > 150 ? content.substring(0, 150) + '...' : content;
  }
}
