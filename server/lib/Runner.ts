import {Battle, Game, Group, GroupSnapshot} from './Game';
import {TenMinutes, ThirtyDays, waitImmediate} from './util';

export async function roundRun(game: Game, time: number, tstr: string) {
  const {rate, fadeRate} = game;
  let groups: GroupSnapshot[] = game.groups.map((g: Group) => new GroupSnapshot(g, tstr));

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
        b = new Battle(groups[x], groups[y], tstr);
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
    let tense = game.tense;
    if (time - user.lastChangeTime > ThirtyDays) {
      // 最近一次改名超过30天。减少对战次数
      tense = 1;
    }
    for (let t = 1; i <= tense; ++i) {
      await createBattle(i, i - t);
      await createBattle(i, i + t);
    }
    for (let n = 0; n < 4; ++n) {
      // 增加一场对战
      if (await createBattle(i, i - tense - Math.ceil(Math.random() * 8))) {
        break;
      }
    }
    // 防止锁死进程，允许http服务器返回数据
    await waitImmediate();
  }
  // 计算积分
  for (let i = 0; i < len; ++i) {
    let group = groups[i];
    // 每回合积分损耗
    group.origin.score *= fadeRate;
    group.origin.score += (len - group.rank) * rate;

    let clan = group.user.clan;
    let encounters = battles.get(i);

    let winCount = 0;
    let meetUp = 0;
    let meetDown = 0;
    for (let [j, battle] of encounters) {
      if (j < i) {
        meetUp++;
      } else {
        meetDown++;
      }
      let scoreChange = (len + 100 - j) * rate;
      if (battle.winner === clan) {
        group.origin.score += scoreChange;
        ++winCount;
      } else {
        group.origin.score -= scoreChange;
      }
    }
    if (group.origin.score < 0) {
      group.origin.score = Math.random();
    }

    let encounterSize = encounters.size;

    if (winCount > encounterSize * 0.75 && group.rank > 100) {
      let j = i - 16;
      // 100名一下如果连胜可以持续得到加分
      while (j >= 0) {
        let battle = await createBattle(i, j);
        if (battle != null && battle.winner === clan) {
          group.origin.score += (len - j) * rate;
          j -= 8;
        } else {
          break;
        }
      }
    }
  }
}
