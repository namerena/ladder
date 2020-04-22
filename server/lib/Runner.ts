import {Battle, Game, Group} from './Game';
import {TenMinutes, ThirtyDays, waitImmediate} from './util';

export async function roundRun(game: Game, time: number, tstr: string) {
  let groups: Group[] = [...game.groups];
  let len = groups.length;
  let battles = new Map<number, Map<number, Battle>>();
  for (let i = 0; i < len; ++i) {
    battles.set(i, new Map<number, Battle>());
  }

  function getBattle(x: number, y: number) {
    return battles.get(x).get(y);
  }
  function setBattle(x: number, y: number, b: Battle) {
    battles.get(x).set(y, b);
    battles.get(y).set(x, b);
  }
  async function createBattle(x: number, y: number) {
    if (y >= 0 && y < len && x !== y) {
      let b = getBattle(x, y);
      if (!b) {
        let b = new Battle(groups[x], groups[y], tstr, time);
        b.run();
        setBattle(x, y, b);
      }
      return b;
    }
    return null;
  }

  // start battle
  for (let i = 0; i < len; ++i) {
    let group = groups[i];
    let user = group.user;
    if (time - user.lastChangeTime > ThirtyDays) {
      // 最近一次改名超过30天。减少对战次数
      await createBattle(i, i - 1);
      await createBattle(i, i + 1);
    } else {
      await createBattle(i, i - 1);
      await createBattle(i, i - 2);
      await createBattle(i, i - 3);
      await createBattle(i, i - 4);
      await createBattle(i, i + 1);
      await createBattle(i, i + 2);
      await createBattle(i, i + 3);
      await createBattle(i, i + 4);
    }
    // 防止锁死进程，允许http服务器返回数据
    await waitImmediate();
  }
  // 计算积分
  for (let i = 0; i < len; ++i) {
    let group = groups[i];
    let clanName = group.user.clanName;
    let encounters = battles.get(i);
    group.score *= (128 - encounters.size) / 128;
    let winCount = 0;
    for (let [j, battle] of encounters) {
      if (battle.winner === clanName) {
        group.score += len + 16 - j;
        ++winCount;
      }
    }
    if (winCount > 6) {
      let j = i - 8;
      // bonus battle
      while (j >= 0) {
        let battle = await createBattle(i, j);
        if (battle != null && battle.winner === clanName) {
          group.score += len + 16 - j;
          j -= 8;
        } else {
          break;
        }
      }
    }
  }
}
