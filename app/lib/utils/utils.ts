import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format date to readable string
export function formatDateAsString(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const differenceInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24))

  if (differenceInDays === 0) {
    return "Today, " + date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    })
  } else if (differenceInDays === 1) {
    return "Yesterday, " + date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    })
  } else if (differenceInDays < 7) {
    return `${differenceInDays} days ago`
  } else {
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: now.getFullYear() !== date.getFullYear() ? 'numeric' : undefined
    })
  }
}

export function getRelativeTime(date: Date | string): string {
  const inputDate = date instanceof Date ? date : new Date(date);
  const now = new Date();
  
  // Reset time part for accurate day comparison
  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const inputDateOnly = new Date(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate());
  
  const differenceInTime = todayDate.getTime() - inputDateOnly.getTime();
  const differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24));
  
  if (differenceInDays === 0) {
    return "today";
  } else if (differenceInDays === 1) {
    return "yesterday";
  } else if (differenceInDays < 7) {
    return `${differenceInDays} days ago`;
  } else if (differenceInDays < 30) {
    const weeks = Math.floor(differenceInDays / 7);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  } else if (differenceInDays < 365) {
    const months = Math.floor(differenceInDays / 30);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  } else {
    const years = Math.floor(differenceInDays / 365);
    return `${years} ${years === 1 ? 'year' : 'years'} ago`;
  }
}
