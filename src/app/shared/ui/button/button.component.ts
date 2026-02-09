import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonType = 'button' | 'submit' | 'reset';

@Component({
  selector: 'app-shared-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type"
      [class]="'btn btn-' + variant"
      [class.loading]="isLoading"
      [disabled]="disabled || isLoading"
      (click)="onClick($event)">
      <span *ngIf="isLoading" class="spinner"></span>
      <ng-content></ng-content>
    </button>
  `,
  styleUrls: ['./button.component.css']
})
export class SharedButtonComponent {
  @Input() type: ButtonType = 'button';
  @Input() variant: ButtonVariant = 'primary';
  @Input() disabled: boolean = false;
  @Input() isLoading: boolean = false;

  @Output() action = new EventEmitter<Event>();

  onClick(event: Event) {
    if (!this.disabled && !this.isLoading) {
      this.action.emit(event);
    }
  }
}
