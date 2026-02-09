import { CanDeactivateFn } from '@angular/router';
import { ComposerComponent } from '../../components/composer/composer.component';

export const draftGuard: CanDeactivateFn<ComposerComponent> = (component) => {
    return component.canDeactivate ? component.canDeactivate() : true;
};
