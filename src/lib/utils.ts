import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function isAuthenticated(): Promise<boolean> {
  const response = fetch(
    "https://frontend-take-home-service.fetch.com/dogs/search",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Include cookies in request
    }
  );
  const res = (await response).status;
  console.log('Util: isAuthenticated response status:', res);
  return res === 200;
}
