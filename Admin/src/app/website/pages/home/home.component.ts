import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthenticationService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  userName: string = 'Usuario';

  constructor(private authService: AuthenticationService) {}

  ngOnInit(): void {
    const currentUser = this.authService.currentUserValue;
    if (currentUser && currentUser.usu_nombre) {
      this.userName = currentUser.usu_nombre;
    }
  }
}
