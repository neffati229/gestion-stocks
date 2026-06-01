import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private snackBar = inject(MatSnackBar);

  success(message: string, duration = 3000): void {
    this.snackBar.open(message, '✕', {
      duration,
      panelClass: ['snack-success'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  error(message: string, duration = 5000): void {
    this.snackBar.open(message, '✕', {
      duration,
      panelClass: ['snack-error'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  warning(message: string, duration = 4000): void {
    this.snackBar.open(message, '✕', {
      duration,
      panelClass: ['snack-warning'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  info(message: string, duration = 3000): void {
    this.snackBar.open(message, '✕', {
      duration,
      panelClass: ['snack-info'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }
}
