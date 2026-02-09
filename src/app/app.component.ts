import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedComponent } from './components/feed/feed.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FeedComponent],
  templateUrl: './app.component.html',
  styles: []
})
export class AppComponent {
  title = 'hashedin-memes';
}
