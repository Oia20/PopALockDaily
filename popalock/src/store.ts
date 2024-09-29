import { atom } from 'nanostores';

export const loggedIn = atom<boolean>(false);

export const streak = atom<number>(0);

export const solvedToday = atom<boolean>(false);

export const credential = atom<string>('');