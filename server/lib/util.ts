export async function waitImmediate() {
  return new Promise((resolve) => {
    setImmediate(resolve);
  });
}

export const FiveMinutes = 5 * 60 * 1000;
export const EightHour = 8 * 60 * 60 * 1000;
export const OneDay = 24 * 60 * 60 * 1000;
export const ThirtyDays = 30 * OneDay;

export function getUTC8Str(time: number, align = FiveMinutes) {
  let tsUTC8 = Math.round(time / align) * align + EightHour;
  return new Date(tsUTC8).toISOString().substring(0, 19);
}

export type TEAM = '1a' | '1b' | '2' | '3' | '4' | '5';
export const TEAMS: TEAM[] = ['1a', '1b', '2', '3', '4', '5'];
