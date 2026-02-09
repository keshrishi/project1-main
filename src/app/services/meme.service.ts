import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Meme, User, UserPreferences, Draft } from '../models/meme.model';
import { LocalStorageService } from './local-storage.service';

@Injectable({
    providedIn: 'root'
})
export class MemeService {

    private memesSubject = new BehaviorSubject<Meme[]>([]);
    public memes$ = this.memesSubject.asObservable();

    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    private preferencesSubject = new BehaviorSubject<UserPreferences>({ theme: 'light', savedPosts: [], likedPosts: [] });
    public preferences$ = this.preferencesSubject.asObservable();

    constructor(private localStorageService: LocalStorageService) {
        this.init();
    }

    private init() {
        this.loadUser();
        this.loadMemes();
        this.loadPreferences();

        if (this.memesSubject.value.length === 0) {
            this.seedData();
        }
    }

    private loadUser() {
        let user = this.localStorageService.getItem<User>('currentUser');
        if (!user) {
            user = { id: 'user_' + Date.now(), username: 'Memer_' + Math.floor(Math.random() * 1000) };
            this.localStorageService.setItem('currentUser', user);
        }
        this.currentUserSubject.next(user);
    }

    private loadMemes() {
        let memes = this.localStorageService.getItem<Meme[]>('memes') || [];

        // Migration: Backfill missing 'team' property for existing data
        const teams = ['Engineering', 'Product', 'Design', 'QA', 'HR', 'Sales', 'Marketing'];
        let hasChanges = false;

        memes = memes.map(m => {
            if (!m.team) {
                hasChanges = true;
                return {
                    ...m,
                    team: 'Engineering'
                };
            }
            return m;
        });

        if (hasChanges) {
            this.saveMemes(memes);
        }

        this.memesSubject.next(memes);
    }

    private loadPreferences() {
        const prefs = this.localStorageService.getItem<UserPreferences>('preferences') || { theme: 'light', savedPosts: [], likedPosts: [] };
        this.preferencesSubject.next(prefs);
    }

    private saveMemes(memes: Meme[]) {
        this.localStorageService.setItem('memes', memes);
        this.memesSubject.next(memes);
    }

    private savePreferences(prefs: UserPreferences) {
        this.localStorageService.setItem('preferences', prefs);
        this.preferencesSubject.next(prefs);
    }

    getMemes(): Meme[] {
        return this.memesSubject.value;
    }

    addMeme(meme: Meme) {
        const memes = [meme, ...this.memesSubject.value];
        this.saveMemes(memes);
    }

    updateMeme(updatedMeme: Meme) {
        const memes = this.memesSubject.value.map(m => m.id === updatedMeme.id ? updatedMeme : m);
        this.saveMemes(memes);
    }

    deleteMeme(id: string) {
        const memes = this.memesSubject.value.filter(m => m.id !== id);
        this.saveMemes(memes);
    }

    toggleLike(memeId: string) {
        const user = this.currentUserSubject.value;
        if (!user) return; // Should not happen

        const memes = [...this.memesSubject.value];
        const memeIndex = memes.findIndex(m => m.id === memeId);
        if (memeIndex === -1) return;

        const meme = { ...memes[memeIndex] };
        const hasLiked = meme.likes.includes(user.id);

        if (hasLiked) {
            meme.likes = meme.likes.filter(id => id !== user.id);
        } else {
            meme.likes = [...meme.likes, user.id];
        }
        memes[memeIndex] = meme;
        this.saveMemes(memes);

        // Update preferences for fast lookup
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
        const user = this.currentUserSubject.value;
        if (!user) return;
        const key = draft.id ? `draft:${user.id}:post:${draft.id}` : `draft:${user.id}:new`;
        this.localStorageService.setItem(key, draft);
    }

    getDraft(postId?: string): Draft | null {
        const user = this.currentUserSubject.value;
        if (!user) return null;
        const key = postId ? `draft:${user.id}:post:${postId}` : `draft:${user.id}:new`;
        return this.localStorageService.getItem<Draft>(key);
    }

    clearDraft(postId?: string) {
        const user = this.currentUserSubject.value;
        if (!user) return;
        const key = postId ? `draft:${user.id}:post:${postId}` : `draft:${user.id}:new`;
        this.localStorageService.removeItem(key);
    }


    private seedData() {
        const mockMemes: Meme[] = [
            {
                id: '1',
                title: 'Deployment Friday',
                content: 'POV: You deploy to prod on a Friday evening and then turn off your phone.',
                author: { id: 'u1', username: 'DevOps_Ninja' },
                timestamp: Date.now() - 3600000,
                likes: [],
                tags: ['deployment', 'friday', 'pov'],
                mood: 'Risky',
                team: 'Engineering',
                flags: [],
                comments: []
            },
            {
                id: '2',
                title: 'It works on my machine',
                content: `
        Customer: It is crashing!
        Me: Works on my machine ¯\\_(ツ)_/¯
        `,
                author: { id: 'u2', username: 'BugSquasher' },
                timestamp: Date.now() - 86400000,
                likes: [],
                tags: ['bugs', 'customer', 'classic'],
                mood: 'Funny',
                team: 'QA',
                flags: [],
                comments: []
            },
            {
                id: '3',
                title: 'Spoiler Alert',
                content: 'Wait until you see the ending! ||The main character was a loop all along||',
                author: { id: 'u3', username: 'PlotTwist' },
                timestamp: Date.now() - 172800000,
                likes: [],
                tags: ['spoiler', 'code'],
                mood: 'Mysterious',
                team: 'Product',
                flags: [],
                comments: []
            }
        ];
        this.saveMemes(mockMemes);
    }
}
