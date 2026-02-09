import { Component, OnInit } from '@angular/core';
import { SharedButtonComponent } from '@shared/ui/button/button.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MemeService } from '../../services/meme.service';
import { Draft, Meme } from '../../models/meme.model';
import { debounceTime, Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-composer',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedButtonComponent],
  templateUrl: './composer.component.html',
  styleUrls: ['./composer.component.css']
})
export class ComposerComponent implements OnInit {
  memeToEdit: Meme | null = null;

  title = '';
  content = '';
  team = 'Engineering';
  mood = '';
  tagsInput = '';

  moods = ['Funny', 'Sarcastic', 'Relatable', 'Risky', 'Mysterious'];
  teams = ['Engineering', 'Product', 'Design', 'QA', 'HR', 'Sales', 'Marketing'];

  private draftSubject = new Subject<void>();
  isPublished = false;

  constructor(
    private memeService: MemeService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // Auto-save draft debounce
    this.draftSubject.pipe(debounceTime(1000)).subscribe(() => {
      this.saveDraft();
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.memeService.getMeme(id).subscribe({
          next: (meme) => {
            this.memeToEdit = meme;
            this.loadDraftOrMeme();
          },
          error: () => this.router.navigate(['/feed'])
        });
      } else {
        this.loadDraft();
      }
    });
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

  canDeactivate(): boolean {
    if ((this.title || this.content) && !this.isPublished) {
      return confirm('You have unsaved changes. Do you really want to leave?');
    }
    return true;
  }

  publish() {
    if (!this.content.trim()) return;

    const tags = this.tagsInput.split(',').map(t => t.trim()).filter(t => t);

    // Mark as published
    this.isPublished = true;

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
      const user = this.memeService.currentUserValue;
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
    }
    this.router.navigate(['/feed']);
  }

  goBack() {
    this.router.navigate(['/feed']);
  }
}
