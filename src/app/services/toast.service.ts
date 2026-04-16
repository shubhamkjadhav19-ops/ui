import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastMessage {
  text: string;
  type: 'success' | 'error';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly currentToastSubject = new BehaviorSubject<ToastMessage | null>(null);
  private readonly queue: ToastMessage[] = [];

  currentToast$ = this.currentToastSubject.asObservable();

  showSuccess(text: string): void {
    this.show(text, 'success');
  }

  showError(text: string): void {
    this.show(text, 'error');
  }

  dismissCurrent(): void {
    if (this.queue.length > 0) {
      this.currentToastSubject.next(this.queue.shift() ?? null);
      return;
    }
    this.currentToastSubject.next(null);
  }

  private show(text: string, type: 'success' | 'error'): void {
    const toast: ToastMessage = {
      text,
      type
    };
    if (!this.currentToastSubject.value) {
      this.currentToastSubject.next(toast);
      return;
    }
    this.queue.push(toast);
  }
}
