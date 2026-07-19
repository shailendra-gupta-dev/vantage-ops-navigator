import { Injectable, signal, computed } from '@angular/core';
import { Device } from '../models';

@Injectable({ providedIn: 'root' })
export class SearchStore {
    private readonly _devices = signal<Device[]>([]);

    // Writable signals for interaction state
    readonly query = signal('');
    readonly isOpen = signal(false);
    readonly activeIndex = signal(-1);

    // Computed search results — re-run automatically when query or devices change
    readonly results = computed<Device[]>(() => {
        const q = this.query().toLowerCase().trim();
        if (q.length < 2) return [];
        return this._devices()
            .filter(d =>
                d.name.toLowerCase().includes(q) ||
                d.ipAddress.includes(q) ||
                d.productFamily.toLowerCase().includes(q) ||
                d.location.toLowerCase().includes(q)
            )
            .slice(0, 8);
    });

    readonly hasQuery = computed(() => this.query().trim().length >= 2);

    // Open/close methods
    open(): void {
        this.isOpen.set(true);
        this.query.set('');
        this.activeIndex.set(-1);
    }

    close(): void {
        this.isOpen.set(false);
        this.query.set('');
        this.activeIndex.set(-1);
    }

    setQuery(q: string): void {
        this.query.set(q);
        this.activeIndex.set(-1);
    }

    setDevices(devices: Device[]): void {
        this._devices.set(devices);
    }

    moveUp(): void {
        this.activeIndex.update(i => Math.max(-1, i - 1));
    }

    moveDown(): void {
        this.activeIndex.update(i =>
            Math.min(this.results().length - 1, i + 1)
        );
    }
}