import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card h-100">
      <div class="card-body">
        <!-- Título -->
        <div class="skeleton-line mb-3" style="width: 70%; height: 24px;"></div>
        
        <!-- Contenido -->
        <div class="skeleton-line mb-2"></div>
        <div class="skeleton-line mb-2" style="width: 90%;"></div>
        <div class="skeleton-line mb-3" style="width: 60%;"></div>
        
        <!-- Acciones -->
        <div class="d-flex justify-content-end gap-2">
          <div class="skeleton-button"></div>
          <div class="skeleton-button"></div>
          <div class="skeleton-button"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .skeleton-line {
      height: 16px;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 4px;
    }

    .skeleton-button {
      width: 36px;
      height: 36px;
      border-radius: 4px;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }

    @keyframes shimmer {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }
  `]
})
export class SkeletonCardComponent {}