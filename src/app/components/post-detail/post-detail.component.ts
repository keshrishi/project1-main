import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MemeService } from '../../services/meme.service';
import { Meme } from '../../models/meme.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.css']
})
export class PostDetailComponent {
  @Input() meme!: Meme;
  @Output() close = new EventEmitter<void>();
  @Output() edit = new EventEmitter<Meme>();

  spoilerStates: { [key: number]: boolean } = {};
  showFlagModal = false;
  flagReason = '';

  constructor(public memeService: MemeService) { }

  get formattedContent(): string[] {
    // Split content by spoilers for rendering
    // This is a simplistic approach. For robust parsing, a regex or parser is better.
    // Assuming format ||spoiler||
    return [this.meme.content];
  }

  // Helper to parse content into segments: { text: string, isSpoiler: boolean }
  get parsedContent(): { text: string, isSpoiler: boolean }[] {
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
    this.memeService.toggleLike(this.meme.id);
  }

  onSave() {
    this.memeService.toggleSave(this.meme.id);
  }

  onDelete() {
    if (confirm('Are you sure you want to delete this post?')) {
      this.memeService.deleteMeme(this.meme.id);
      this.close.emit();
    }
  }

  onEdit() {
    this.edit.emit(this.meme);
  }

  onShare() {
    const url = window.location.origin + '/post/' + this.meme.id; // simulation
    navigator.clipboard.writeText(`Check out this meme: ${this.meme.title || 'Untitled'} - ${this.meme.id}`);
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
    // In a real app, send to service. Here we just mock it.
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
}
