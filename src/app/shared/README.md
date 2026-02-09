# Shared Module

This directory is for code that is shared across multiple features of the application.

## Structure

- `ui/`: Reusable UI components (e.g., buttons, loaders, modal wrappers) that do not belong to a specific feature.
- `directives/`: Custom directives used throughout the app.
- `pipes/`: Custom pipes used throughout the app.
- `utils/`: Helper functions and utilities.

## Usage

Since this project uses Standalone Components (Angular 14+), you can import shared components directly where needed.

Example:
```typescript
import { SharedButtonComponent } from 'src/app/shared/components/shared-button/shared-button.component';

@Component({
  imports: [SharedButtonComponent, ...],
  ...
})
export class FeatureComponent {}
```
