import { Battle, Game } from "./Game";

async function run(game: Game, time: number) {
  let seed = `seed:${new Date(time).toISOString()}@!`;
  let pendingGroups = [...this.game.groups];
  let len = pendingGroups.length;
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

  // start battle

  // count score
}
