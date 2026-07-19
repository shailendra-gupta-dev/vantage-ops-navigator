import { Injectable, signal, computed } from '@angular/core';
import { Contract } from '../models';

@Injectable({ providedIn: 'root' })
export class ContractStore {
    private readonly _contracts = signal<Contract[]>([]);

    // Only contracts expiring within 90 days — shown in Pulse Strip
    readonly expiringContracts = computed(() =>
        this._contracts()
            .filter(c => c.daysToExpiry <= 90)
            .sort((a, b) => a.daysToExpiry - b.daysToExpiry)
    );

    readonly redCount = computed(() =>
        this.expiringContracts().filter(c => c.urgency === 'red').length
    );

    setContracts(contracts: Contract[]): void {
        this._contracts.set(contracts);
    }
}