import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const user = authService.currentUserValue;

    if (user && user.role === 'admin') {
        return true;
    }

    // Redirect to home if not admin
    return router.createUrlTree(['/feed']);
};
