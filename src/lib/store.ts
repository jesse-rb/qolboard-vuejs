import { get, writable, type Writable } from "svelte/store";

export type AppStore = {
    isAuthenticated: boolean
    email: string
    headerHeight: number
    controlPanelHeight: number
}

export const appStore:Writable<AppStore> = writable({
    isAuthenticated: false,
    email: "",
    headerHeight: 0,
    controlPanelHeight: 0
});

export function isAuthenticated() {
    return get(appStore).isAuthenticated;
}
