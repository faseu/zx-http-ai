import { getCookie, removeCookie, setCookie } from 'tiny-cookie';

export const TOKEN = 'token';

export const getToken = (): string => getCookie(TOKEN) || '';

export const setToken = (token: string): void =>
  setCookie(TOKEN, token, {
    expires: '1Y',
  });

export const removeToken = (): void => removeCookie(TOKEN);
