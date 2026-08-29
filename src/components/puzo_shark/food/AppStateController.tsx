import type { IAppState } from "./tests/interfaces";
export const AppStateController = {
    getState(): IAppState {
        const defaultState: IAppState = {
            diversEaten: 0,
            diversTimeLeftSec: 0,
            coins: 0,
            ownedSkins: ['classic']
        }
        const stateStr = localStorage.getItem('eat_steak');
        if (!stateStr) return defaultState;
        try {
            const parsed = JSON.parse(stateStr);
            const appState: IAppState = { ...defaultState, ...parsed };
            if (!Array.isArray(appState.ownedSkins)) appState.ownedSkins = [...defaultState.ownedSkins];
            if (typeof appState.coins !== 'number' || isNaN(appState.coins)) appState.coins = defaultState.coins;
            return appState;
        } catch {
            return defaultState;
        }
    },
    setState(newState: IAppState) {
        localStorage.setItem('eat_steak', JSON.stringify(newState))
    }
}

