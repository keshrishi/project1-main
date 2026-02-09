import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap, switchMap } from 'rxjs/operators';
import { User } from '../models/meme.model';
import { Router } from '@angular/router';

export interface AuthResponse {
    accessToken: string;
    user: User;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'http://localhost:3000';
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    public get currentUserValue(): User | null {
        return this.currentUserSubject.value;
    }

    constructor(private http: HttpClient, private router: Router) {
        this.loadUserFromStorage();
    }

    private loadUserFromStorage() {
        const user = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (user && token) {
            try {
                this.currentUserSubject.next(JSON.parse(user));
            } catch (e) {
                console.error('Error parsing user from storage', e);
            }
        }
    }

    login(credentials: { email: string; password: string }): Observable<AuthResponse> {
        // Try standard json-server-auth login
        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
            tap(response => {
                this.setSession(response);
            }),
            catchError(err => {
                // If 404, it means /login endpoint doesn't exist (plain json-server)
                // Fallback to querying users directly
                if (err.status === 404) {
                    return this.http.get<User[]>(`${this.apiUrl}/users?email=${credentials.email}&password=${credentials.password}`).pipe(
                        map(users => {
                            if (users.length > 0) {
                                const user = users[0];
                                const response: AuthResponse = {
                                    accessToken: 'fake-jwt-token-' + user.id, // Simulate token
                                    user: user
                                };
                                this.setSession(response);
                                return response;
                            } else {
                                throw new Error('Invalid credentials');
                            }
                        })
                    );
                }
                return throwError(() => err);
            })
        );
    }

    register(user: Partial<User> & { password: string }): Observable<AuthResponse> {
        // Try standard json-server-auth register
        return this.http.post<AuthResponse>(`${this.apiUrl}/register`, user).pipe(
            tap(response => {
                this.setSession(response);
            }),
            catchError(err => {
                // Fallback for plain json-server
                if (err.status === 404) {
                    // Check if user exists first to avoid duplicates (optional but good)
                    return this.http.get<User[]>(`${this.apiUrl}/users?email=${user.email}`).pipe(
                        switchMap(existing => {
                            if (existing.length > 0) {
                                return throwError(() => new Error('Email already exists'));
                            }
                            // Create new user (excluding password if strictly following model, but keeping it for simple auth check)
                            const newUser = { ...user, id: crypto.randomUUID(), role: 'user' as const };
                            return this.http.post<User>(`${this.apiUrl}/users`, newUser).pipe(
                                map(createdUser => {
                                    const response: AuthResponse = {
                                        accessToken: 'fake-jwt-token-' + createdUser.id,
                                        user: createdUser
                                    };
                                    this.setSession(response);
                                    return response;
                                })
                            );
                        })
                    );
                }
                return throwError(() => err);
            })
        );
    }

    private setSession(authResult: AuthResponse) {
        localStorage.setItem('token', authResult.accessToken);
        localStorage.setItem('user', JSON.stringify(authResult.user));
        this.currentUserSubject.next(authResult.user);
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.currentUserSubject.next(null);
        this.router.navigate(['/auth/login']);
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }
}
