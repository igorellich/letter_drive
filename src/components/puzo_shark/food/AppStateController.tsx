import type { IAppState } from "./tests/interfaces";
export const AppStateController = {
    getState(): IAppState {
        const stateStr = localStorage.getItem('eat_steak');
        let appState: IAppState = {
            diversEaten: 0,
            diversTimeLeftSec: 0
        }
        if (stateStr) {
            appState = JSON.parse(stateStr);
        }
        return appState;
    },
    setState(newState: IAppState) {
        localStorage.setItem('eat_steak', JSON.stringify(newState))
    }
}

