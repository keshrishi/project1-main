import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MemeService } from '../../services/meme.service';
import { Meme } from '../../models/meme.model';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.css']
})
export class PostDetailComponent implements OnInit {
  meme: Meme | null = null;

  spoilerStates: { [key: number]: boolean } = {};
  showFlagModal = false;
  flagReason = '';

  constructor(
    public memeService: MemeService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.memeService.getMeme(id).subscribe({
          next: (meme) => {
            this.meme = meme;
            this.updateSpoilerStates(); // Reset if needed
          },
          error: (err) => {
            console.error('Error loading meme', err);
            this.router.navigate(['/feed']);
          }
        });
      }
    });
  }

  get formattedContent(): string[] {
    if (!this.meme) return [];
    return [this.meme.content];
  }

  get parsedContent(): { text: string, isSpoiler: boolean }[] {
    if (!this.meme) return [];
    const regex = /\|\|(.*?)\|\|/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(this.meme.content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ text: this.meme.content.substring(lastIndex, match.index), isSpoiler: false });
      }
      parts.push({ text: match[1], isSpoiler: true });
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < this.meme.content.length) {
      parts.push({ text: this.meme.content.substring(lastIndex), isSpoiler: false });
    }

    return parts;
  }

  updateSpoilerStates() {
    this.spoilerStates = {};
  }

  toggleSpoiler(index: number) {
    this.spoilerStates[index] = !this.spoilerStates[index];
  }

  expandAll() {
    this.parsedContent.forEach((_, i) => this.spoilerStates[i] = true);
  }

  collapseAll() {
    this.parsedContent.forEach((_, i) => this.spoilerStates[i] = false);
  }

  onLike() {
    if (this.meme) this.memeService.toggleLike(this.meme.id);
  }

  onSave() {
    if (this.meme) this.memeService.toggleSave(this.meme.id);
  }

  onDelete() {
    if (this.meme && confirm('Are you sure you want to delete this post?')) {
      this.memeService.deleteMeme(this.meme.id);
      this.router.navigate(['/feed']);
    }
  }

  onEdit() {
    if (this.meme) this.router.navigate(['/edit', this.meme.id]);
  }

  onShare() {
    if (!this.meme) return;
    const url = window.location.origin + '/post/' + this.meme.id;
    navigator.clipboard.writeText(`Check out this meme: ${this.meme.title || 'Untitled'} - ${url}`);
    alert('Link copied to clipboard!');
  }

  openFlagModal() {
    this.showFlagModal = true;
  }

  closeFlagModal() {
    this.showFlagModal = false;
    this.flagReason = '';
  }

  submitFlag() {
    if (!this.flagReason.trim()) return;
    alert('Post flagged for review.');
    this.closeFlagModal();
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

  goBack() {
    this.router.navigate(['/feed']);
  }
}
