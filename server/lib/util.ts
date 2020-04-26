export async function waitImmediate() {
  return new Promise((resolve) => {
    setImmediate(resolve);
  });
}

export function getUTC8Str(time: number) {
  let tsUTC8 = Math.round(new Date().getTime() / TenMinutes) * TenMinutes + 8 * 3600000;
  return new Date(tsUTC8).toISOString().substring(0, 19);
}

export const TenMinutes = 10 * 60 * 1000;
export const OneDay = 24 * 60 * 60 * 1000;
export const ThirtyDays = 30 * OneDay;

export type TEAM = '1' | '2' | '5';
export const TEAMS: TEAM[] = ['1', '2', '5'];
