import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class LocalStorageService {

    private prefix = 'hashedin_memes_';

    constructor() { }

    setItem(key: string, value: any): void {
        localStorage.setItem(this.prefix + key, JSON.stringify(value));
    }

    getItem<T>(key: string): T | null {
        const item = localStorage.getItem(this.prefix + key);
        if (item) {
            try {
                return JSON.parse(item);
            } catch (e) {
                console.error('Error parsing local storage item', key, e);
                return null;
            }
        }
        return null;
    }

    removeItem(key: string): void {
        localStorage.removeItem(this.prefix + key);
    }

    clear(): void {
        localStorage.clear();
    }
}
