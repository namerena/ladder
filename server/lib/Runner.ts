import {Battle, Game, Group, GroupSnapshot} from './Game';
import {TenMinutes, ThirtyDays, waitImmediate} from './util';

export async function roundRun(game: Game, time: number, tstr: string) {
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
    if (time - user.lastChangeTime > ThirtyDays) {
      // 最近一次改名超过30天。减少对战次数
      await createBattle(i, i - 1);
      await createBattle(i, i + 1);
    } else {
      await createBattle(i, i - 1);
      await createBattle(i, i - 2);
      await createBattle(i, i - 3);
      await createBattle(i, i - 4);
      if ((await createBattle(i, i + 4)) == null) {
        // 使排名最后的新注册选手得到更多战斗机会
        await createBattle(i, i - 5);
        await createBattle(i, i - 6);
        await createBattle(i, i - 7);
        await createBattle(i, i - 8);
      } else {
        await createBattle(i, i + 1);
        await createBattle(i, i + 2);
        await createBattle(i, i + 3);
      }
    }
    // 防止锁死进程，允许http服务器返回数据
    await waitImmediate();
  }
  // 计算积分
  for (let i = 0; i < len; ++i) {
    let group = groups[i];
    // 每回合积分损耗
    group.origin.score *= 0.99;

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
      if (battle.winner === clan) {
        group.origin.score += len + 100 - j;
        ++winCount;
      }
    }
    let encounterSize = encounters.size;

    group.origin.score -= encounterSize * (len + 100 - group.rank) * 0.48 - 48;
    if (group.origin.score < 0) {
      group.origin.score = Math.random();
    }

    if (winCount > 6 && group.rank > 100) {
      let j = i - 8;
      // 100名一下如果连胜可以持续得到加分
      while (j >= 0) {
        let battle = await createBattle(i, j);
        if (battle != null && battle.winner === clan) {
          group.origin.score += (len - j) >> 1;
          j -= 8;
        } else {
          break;
        }
      }
    }
  }
}
