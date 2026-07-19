import { Injectable, signal, computed } from '@angular/core';
import { Advisory } from '../models';

function calcPriorityScore(adv: Advisory): number {
    return (
        adv.cvss *
        (adv.activeExploit ? 3 : 1) *
        adv.affectedDeviceCount *
        Math.log(adv.daysSincePatch + 1)
    );
}

@Injectable({ providedIn: 'root' })
export class RiskStore {
    // Private writable signal — mutated only through methods below
    private readonly _advisories = signal<Advisory[]>([]);

    // Public computed signals — read-only, auto-update when _advisories changes
    readonly topRisk = computed<Advisory | null>(() => {
        const scored = this._advisories().map(a => ({
            ...a,
            priorityScore: calcPriorityScore(a),
        }));
        return scored.sort((a, b) => b.priorityScore - a.priorityScore)[0] ?? null;
    });

    readonly allClear = computed(() =>
        this._advisories().every(
            a => a.severity !== 'critical' && a.severity !== 'high'
        )
    );

    readonly criticalCount = computed(() =>
        this._advisories().filter(a => a.severity === 'critical').length
    );

    readonly highCount = computed(() =>
        this._advisories().filter(a => a.severity === 'high').length
    );

    // Mutation method — the only way to write to _advisories
    setAdvisories(advisories: Advisory[]): void {
        this._advisories.set(advisories);
    }
}