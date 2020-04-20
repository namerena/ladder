import {Battle, Game, Group} from './Game';
const namerena = require('./namerenaRun.dart.js');

const ThirtyDays = 30 * 24 * 60 * 60 * 1000;

async function run(game: Game, time: number) {
  let tsUTC8 = Math.round(new Date().getTime() / 1800000) * 1800000 + 8 * 3600000;
  let seed = `seed:${new Date(tsUTC8).toISOString().substring(0, 19)}@!`;
  let groups: Group[] = [...this.game.groups];
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
        let b = new Battle(groups[x], groups[y], time);
        let winners: string[] = namerena.run(`${b.group0.names}\n\n${b.group1.names}\n\n${seed}`);
        b.winner = winners[0].split('@').pop();
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
      // not logged in for more than 30 days, assign less battle
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
  }
  // count score
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
        if (battle !== null && battle.winner === clanName) {
          group.score += len + 16 - j;
          j -= 8;
        } else {
          break;
        }
      }
    }
  }
}
