import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { debounce } from 'lodash';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Debounce API calls to reduce server load
export const debouncedFetch = debounce(
  async (url: string, options: RequestInit) => {
    const response = await fetch(url, options);
    return response.json();
  },
  300
);
