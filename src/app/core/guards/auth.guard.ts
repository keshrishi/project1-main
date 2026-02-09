import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Check if user is actually logged in (has both token and user object)
    if (authService.isAuthenticated() && authService.currentUserValue) {
        return true;
    }

    // Redirect to login page with return url
    return router.createUrlTree(['/auth/login'], { queryParams: { returnUrl: state.url } });
};
