import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, of, combineLatest, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Meme, User, UserPreferences, Draft } from '../models/meme.model';
import { LocalStorageService } from './local-storage.service';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class MemeService {

    private apiUrl = 'http://localhost:3000';

    private memesSubject = new BehaviorSubject<Meme[]>([]);
    public memes$ = this.memesSubject.asObservable();

    // Preferences still local for now as per requirements "Persist data on server (db.json)" 
    // but typically preferences are user specific. 
    // Requirement says "Keep drafts client-side (localStorage)".
    // Profile "saved and liked posts via separate tabs/routes".
    // I'll keep preferences in local storage for simplicity or move to server if I find a way to store per user config easily.
    // user object in db.json doesn't have preferences. I'll stick to local for preferences to avoid schema changes not requested.

    private preferencesSubject = new BehaviorSubject<UserPreferences>({ theme: 'light', savedPosts: [], likedPosts: [] });
    public preferences$ = this.preferencesSubject.asObservable();

    // Current User is handled by AuthService, but MemeService used to have it.
    // I should proxy or use AuthService.
    public get currentUser$() {
        return this.authService.currentUser$;
    }

    public get currentUserValue() {
        return this.authService.currentUserValue;
    }

    constructor(
        private http: HttpClient,
        private localStorageService: LocalStorageService,
        private authService: AuthService
    ) {
        this.init();
    }

    private init() {
        this.loadMemes();
        this.loadPreferences();
    }

    public loadMemes() {
        // Fetch posts and users (if allowed) to map data
        const posts$ = this.http.get<any[]>(`${this.apiUrl}/posts`);
        const users$ = this.http.get<User[]>(`${this.apiUrl}/users`).pipe(
            catchError(() => of([])) // Return empty array if /users is 401/403
        );

        combineLatest([posts$, users$]).subscribe({
            next: ([posts, users]) => {
                const mappedMemes: Meme[] = posts.map(post => {
                    const author = users.find(u => u.id === post.userId) || {
                        id: post.userId || 0,
                        username: 'Unknown User',
                        email: '',
                        role: 'user'
                    } as User;

                    return {
                        ...post,
                        id: post.id.toString(), // Ensure ID is string
                        title: post.title || post.head, // Map head to title
                        author: author,
                        likes: post.likes || [],
                        tags: post.tags || [],
                        comments: post.comments || [],
                        timestamp: post.timestamp || Date.now() // Fallback timestamp
                    } as Meme;
                });
                this.memesSubject.next(mappedMemes);
            },
            error: (err) => console.error('Failed to load memes', err)
        });
    }

    private loadPreferences() {
        const prefs = this.localStorageService.getItem<UserPreferences>('preferences') || { theme: 'light', savedPosts: [], likedPosts: [] };
        this.preferencesSubject.next(prefs);
    }

    private savePreferences(prefs: UserPreferences) {
        this.localStorageService.setItem('preferences', prefs);
        this.preferencesSubject.next(prefs);
    }

    getMeme(id: string): Observable<Meme> {
        return this.http.get<any>(`${this.apiUrl}/posts/${id}`).pipe(
            map(post => {
                // We might need to fetch user here too if we want full details, 
                // but for now let's return with basic author or fetch separately if needed.
                // For detail view, we usually need author. 
                // Let's assume detail view can handle it or we fetch user.
                // Ideally we should chain fetch user.
                return {
                    ...post,
                    id: post.id.toString(),
                    title: post.title || post.head,
                    author: { id: post.userId, username: 'User ' + post.userId, email: '', role: 'user' } as User, // Placeholder if single fetch
                    likes: post.likes || [],
                    tags: post.tags || [],
                    comments: post.comments || []
                } as Meme;
            })
        );
    }

    addMeme(meme: Meme) {
        // We need to convert Meme model back to what backend expects
        const payload = {
            head: meme.title,
            content: meme.content,
            userId: meme.author.id,
            timestamp: meme.timestamp,
            likes: meme.likes,
            tags: meme.tags,
            mood: meme.mood,
            team: meme.team,
            deleted: false
        };

        this.http.post<any>(`${this.apiUrl}/posts`, payload).subscribe({
            next: (newPost) => {
                // Construct new meme object with author
                const newMeme: Meme = {
                    ...meme,
                    id: newPost.id.toString(),
                    title: newPost.head
                };
                const currentMemes = this.memesSubject.value;
                this.memesSubject.next([newMeme, ...currentMemes]);
            },
            error: (err) => console.error('Failed to add meme', err)
        });
    }

    updateMeme(updatedMeme: Meme) {
        const payload = {
            head: updatedMeme.title,
            content: updatedMeme.content,
            userId: updatedMeme.author.id,
            timestamp: updatedMeme.timestamp,
            likes: updatedMeme.likes,
            tags: updatedMeme.tags,
            mood: updatedMeme.mood,
            team: updatedMeme.team,
            deleted: updatedMeme.deleted
        };

        this.http.put<any>(`${this.apiUrl}/posts/${updatedMeme.id}`, payload).subscribe({
            next: (post) => {
                const memes = this.memesSubject.value.map(m => m.id === post.id.toString() ? updatedMeme : m);
                this.memesSubject.next(memes);
            },
            error: (err) => console.error('Failed to update meme', err)
        });
    }

    // Hard delete (Owner only)
    deleteMeme(id: string) {
        this.http.delete(`${this.apiUrl}/posts/${id}`).subscribe({
            next: () => {
                const memes = this.memesSubject.value.filter(m => m.id !== id);
                this.memesSubject.next(memes);
            },
            error: (err) => console.error('Failed to delete meme', err)
        });
    }

    // Soft delete (Admin)
    softDeleteMeme(id: string) {
        this.http.patch(`${this.apiUrl}/posts/${id}`, { deleted: true }).subscribe({
            next: () => {
                this.updateLocalMeme(id, { deleted: true });
            },
            error: (err) => console.error('Failed to soft delete meme', err)
        });
    }

    restoreMeme(id: string) {
        this.http.patch(`${this.apiUrl}/posts/${id}`, { deleted: false }).subscribe({
            next: () => {
                this.updateLocalMeme(id, { deleted: false });
            },
            error: (err) => console.error('Failed to restore meme', err)
        });
    }

    flagMeme(id: string, reason: string) {
        // We need to fetch current flags first or just push if backend supports it.
        // JSON-Server PATCH replaces arrays unless we use some middleware, but usually it replaces.
        // So we should find the meme locally, add flag, and PATCH the whole flags array.
        const meme = this.memesSubject.value.find(m => m.id === id);
        if (!meme) return;

        const newFlag = { userId: this.authService.currentUserValue?.id || 'anon', reason, timestamp: Date.now() };
        const updatedFlags = [...(meme.flags || []), newFlag];

        this.http.patch(`${this.apiUrl}/posts/${id}`, { flags: updatedFlags }).subscribe({
            next: () => {
                this.updateLocalMeme(id, { flags: updatedFlags });
            },
            error: (err) => console.error('Failed to flag meme', err)
        });
    }

    resolveFlag(id: string, flagIndex: number) {
        // Remove flag? Or mark resolved? Requirement: "Close flag (PATCH)".
        // Maybe remove it from the array.
        const meme = this.memesSubject.value.find(m => m.id === id);
        if (!meme) return;

        const updatedFlags = [...(meme.flags || [])];
        updatedFlags.splice(flagIndex, 1); // Remove it

        this.http.patch(`${this.apiUrl}/posts/${id}`, { flags: updatedFlags }).subscribe({
            next: () => {
                this.updateLocalMeme(id, { flags: updatedFlags });
            },
            error: (err) => console.error('Failed to resolve flag', err)
        });
    }

    private updateLocalMeme(id: string, partial: Partial<Meme>) {
        const memes = this.memesSubject.value.map(m => m.id === id ? { ...m, ...partial } : m);
        this.memesSubject.next(memes);
    }



    toggleLike(memeId: string) {
        const user = this.authService.currentUserValue;
        if (!user) return;

        const memes = this.memesSubject.value;
        const meme = memes.find(m => m.id === memeId);
        if (!meme) return;

        const hasLiked = meme.likes.includes(String(user.id));
        let updatedLikes: string[];

        if (hasLiked) {
            updatedLikes = meme.likes.filter(id => id !== String(user.id));
        } else {
            updatedLikes = [...meme.likes, String(user.id)];
        }

        // Optimistic update
        const updatedMeme = { ...meme, likes: updatedLikes };
        const updatedMemes = memes.map(m => m.id === memeId ? updatedMeme : m);
        this.memesSubject.next(updatedMemes);

        // Server update
        this.http.patch(`${this.apiUrl}/posts/${memeId}`, { likes: updatedLikes }).subscribe({
            error: (err) => {
                console.error('Failed to toggle like', err);
                // Revert on error
                this.memesSubject.next(memes);
            }
        });

        // Update preferences for fast lookup (Local storage)
        const prefs = { ...this.preferencesSubject.value };
        if (hasLiked) {
            prefs.likedPosts = prefs.likedPosts.filter(id => id !== memeId);
        } else {
            prefs.likedPosts = [...prefs.likedPosts, memeId];
        }
        this.savePreferences(prefs);
    }



    toggleSave(memeId: string) {
        const prefs = { ...this.preferencesSubject.value };
        const isSaved = prefs.savedPosts.includes(memeId);

        if (isSaved) {
            prefs.savedPosts = prefs.savedPosts.filter(id => id !== memeId);
        } else {
            prefs.savedPosts = [...prefs.savedPosts, memeId];
        }
        this.savePreferences(prefs);
    }

    saveDraft(draft: Draft) {
        const user = this.authService.currentUserValue;
        if (!user) return;
        const key = draft.id ? `draft:${user.id}:post:${draft.id}` : `draft:${user.id}:new`;
        this.localStorageService.setItem(key, draft);
    }

    getDraft(postId?: string): Draft | null {
        const user = this.authService.currentUserValue;
        if (!user) return null;
        const key = postId ? `draft:${user.id}:post:${postId}` : `draft:${user.id}:new`;
        return this.localStorageService.getItem<Draft>(key);
    }

    clearDraft(postId?: string) {
        const user = this.authService.currentUserValue;
        if (!user) return;
        const key = postId ? `draft:${user.id}:post:${postId}` : `draft:${user.id}:new`;
        this.localStorageService.removeItem(key);
    }
}
