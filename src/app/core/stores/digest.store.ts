import { Injectable, signal, computed, effect } from '@angular/core';
import { DigestItem } from '../models';

const LAST_VISIT_KEY = 'von_last_visit';

function loadLastVisit(): Date {
    if (typeof sessionStorage === 'undefined') {
        // SSR guard — sessionStorage is not available server-side
        return new Date(Date.now() - 48 * 3600 * 1000);
    }
    const stored = sessionStorage.getItem(LAST_VISIT_KEY);
    return stored ? new Date(stored) : new Date(Date.now() - 48 * 3600 * 1000);
}

@Injectable({ providedIn: 'root' })
export class DigestStore {
    private readonly _items = signal<DigestItem[]>([]);
    readonly lastVisit = signal<Date>(loadLastVisit());

    // Delta computed signals — each filters by lastVisit automatically
    readonly newAdvisories = computed(() =>
        this._items().filter(
            i => i.type === 'advisory' && new Date(i.publishedAt) > this.lastVisit()
        )
    );

    readonly newLdos = computed(() =>
        this._items().filter(
            i => i.type === 'ldos' && new Date(i.publishedAt) > this.lastVisit()
        )
    );

    readonly newContracts = computed(() =>
        this._items().filter(
            i => i.type === 'contract' && new Date(i.publishedAt) > this.lastVisit()
        )
    );

    readonly newCases = computed(() =>
        this._items().filter(
            i => i.type === 'case' && new Date(i.publishedAt) > this.lastVisit()
        )
    );

    readonly newItems = computed<DigestItem[]>(() => [
        ...this.newAdvisories(),
        ...this.newLdos(),
        ...this.newContracts(),
        ...this.newCases(),
    ]);

    readonly totalNewCount = computed(() => this.newItems().length);

    constructor() {
        // Persist lastVisit to sessionStorage whenever it changes
        // effect() is the correct Angular primitive for side effects
        effect(() => {
            const visit = this.lastVisit();
            if (typeof sessionStorage !== 'undefined') {
                sessionStorage.setItem(LAST_VISIT_KEY, visit.toISOString());
            }
        });
    }

    markAllSeen(): void {
        this.lastVisit.set(new Date());
    }

    setItems(items: DigestItem[]): void {
        this._items.set(items);
    }
}