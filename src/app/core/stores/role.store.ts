import { Injectable, signal } from '@angular/core';
import { UserRole } from '../models';

@Injectable({ providedIn: 'root' })
export class RoleStore {
    // Writable signal — the single source of truth for current role
    readonly currentRole = signal<UserRole>('engineer');

    setRole(role: UserRole): void {
        this.currentRole.set(role);
    }
}