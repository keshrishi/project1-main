import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MemeService } from '../../services/meme.service';
import { Router, RouterModule } from '@angular/router';
import { map } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  constructor(public memeService: MemeService) { }
}
