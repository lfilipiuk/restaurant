export const STORE_OPENING_TIME = 9; // 9am
export const STORE_CLOSING_TIME = 12; // 5pm
export const OPENING_HOURS_INTERVAL = 30; // 30 minutes

export const MAX_FILE_SIZE = 1240 * 1024 * 5 // 5MB

export const categories = ['all', 'breakfast', 'lunch', 'dinner', 'dessert'] as const;

//I can mock this to text different dates
export const now = new Date();

