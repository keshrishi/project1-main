import { Routes } from '@angular/router';
import { FeedComponent } from './components/feed/feed.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { authGuard } from './core/guards/auth.guard';
import { draftGuard } from './core/guards/draft.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'feed', pathMatch: 'full' },
    {
        path: 'feed',
        component: FeedComponent,
        canActivate: [authGuard]
    },
    {
        path: 'auth',
        children: [
            { path: 'login', component: LoginComponent },
            { path: 'register', component: RegisterComponent },
            { path: '', redirectTo: 'login', pathMatch: 'full' }
        ]
    },
    {
        path: 'post/:id',
        loadComponent: () => import('./components/post-detail/post-detail.component').then(m => m.PostDetailComponent),
        canActivate: [authGuard]
    },
    {
        path: 'compose',
        loadComponent: () => import('./components/composer/composer.component').then(m => m.ComposerComponent),
        canActivate: [authGuard],
        canDeactivate: [draftGuard]
    },
    {
        path: 'edit/:id',
        loadComponent: () => import('./components/composer/composer.component').then(m => m.ComposerComponent),
        canActivate: [authGuard],
        canDeactivate: [draftGuard]
    },
    {
        path: 'me',
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'saved', pathMatch: 'full' },
            { path: 'saved', loadComponent: () => import('./features/profile/profile-posts.component').then(m => m.SavedPostsComponent) },
            { path: 'liked', loadComponent: () => import('./features/profile/profile-posts.component').then(m => m.LikedPostsComponent) }
        ]
    },
    {
        path: 'admin',
        children: [
            {
                path: 'moderation',
                loadComponent: () => import('./features/admin/admin-moderation.component').then(m => m.AdminModerationComponent),
                canActivate: [authGuard, roleGuard]
            }
        ]
    },
    { path: '**', redirectTo: 'feed' }
];
