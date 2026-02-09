import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SharedButtonComponent } from '@shared/ui/button/button.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MemeService } from '../../services/meme.service';
import { Draft, Meme } from '../../models/meme.model';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-composer',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedButtonComponent],
  templateUrl: './composer.component.html',
  styleUrls: ['./composer.component.css']
})
export class ComposerComponent implements OnInit {
  @Input() memeToEdit: Meme | null = null;
  @Output() close = new EventEmitter<void>();

  title = '';
  content = '';
  team = 'Engineering';
  mood = '';
  tagsInput = '';

  moods = ['Funny', 'Sarcastic', 'Relatable', 'Risky', 'Mysterious'];
  teams = ['Engineering', 'Product', 'Design', 'QA', 'HR', 'Sales', 'Marketing'];

  private draftSubject = new Subject<void>();

  constructor(private memeService: MemeService) {
    // Auto-save draft debounce
    this.draftSubject.pipe(debounceTime(1000)).subscribe(() => {
      this.saveDraft();
    });
  }

  ngOnInit(): void {
    if (this.memeToEdit) {
      this.loadDraftOrMeme();
    } else {
      this.loadDraft();
    }
  }

  loadDraftOrMeme() {
    // Check for edit draft first
    const draft = this.memeService.getDraft(this.memeToEdit!.id);
    if (draft) {
      this.populateFromDraft(draft);
    } else {
      // Initialize from existing meme
      this.title = this.memeToEdit!.title || '';
      this.content = this.memeToEdit!.content;
      this.mood = this.memeToEdit!.mood;
      this.team = this.memeToEdit!.team || 'Engineering'; // Default
      this.tagsInput = this.memeToEdit!.tags.join(', ');
    }
  }

  loadDraft() {
    const draft = this.memeService.getDraft();
    if (draft) {
      this.populateFromDraft(draft);
    }
  }

  populateFromDraft(draft: Draft) {
    this.title = draft.title;
    this.content = draft.content;
    this.mood = draft.mood;
    this.team = draft.team || '';
    this.tagsInput = draft.tags.join(', ');
  }

  onInputChange() {
    this.draftSubject.next();
  }

  saveDraft() {
    const tags = this.tagsInput.split(',').map(t => t.trim()).filter(t => t);
    const draft: Draft = {
      id: this.memeToEdit?.id,
      title: this.title,
      content: this.content,
      mood: this.mood,
      team: this.team,
      tags: tags,
      lastSaved: Date.now()
    };
    this.memeService.saveDraft(draft);
  }

  publish() {
    if (!this.content.trim()) return;

    const tags = this.tagsInput.split(',').map(t => t.trim()).filter(t => t);

    if (this.memeToEdit) {
      // Update
      const updatedMeme: Meme = {
        ...this.memeToEdit,
        title: this.title,
        content: this.content,
        mood: this.mood || 'Funny',
        team: this.team || 'Engineering',
        tags: tags
      };
      this.memeService.updateMeme(updatedMeme);
      this.memeService.clearDraft(this.memeToEdit.id);
    } else {
      // Create
      // Subscribe needs to be handled carefully. Usually avoiding inside method is better, 
      // but for this simple app it's okay. BETTER: user take(1).
      this.memeService.currentUser$.subscribe(user => {
        if (user) {
          const newMeme: Meme = {
            id: Date.now().toString(),
            title: this.title,
            content: this.content,
            mood: this.mood || 'Funny',
            team: this.team || 'Engineering',
            tags: tags,
            author: user,
            timestamp: Date.now(),
            likes: [],
            flags: [],
            comments: []
          };
          this.memeService.addMeme(newMeme);
          this.memeService.clearDraft();
        }
      }).unsubscribe(); // Close subscription immediately
    }
    this.close.emit();
  }
}
