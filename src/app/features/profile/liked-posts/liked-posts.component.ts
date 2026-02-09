import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MemeService } from '../../../services/meme.service';
import { Router } from '@angular/router';
import { combineLatest, map } from 'rxjs';

@Component({
    selector: 'app-liked-posts',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './liked-posts.component.html',
    styleUrls: ['./liked-posts.component.css']
})
export class LikedPostsComponent {
    displayedMemes$ = combineLatest([this.memeService.memes$, this.memeService.preferences$]).pipe(
        map(([memes, prefs]) => memes.filter(m => prefs.likedPosts.includes(m.id)))
    );

    constructor(public memeService: MemeService, private router: Router) { }

    openMeme(id: string) { this.router.navigate(['/post', id]); }
    getPreviewContent(content: string): string { return content.length > 100 ? content.substring(0, 100) + '...' : content; }
}
