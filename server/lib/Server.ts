import {Game, User} from './Game';

type TEAM = '5';
let TEAMS: TEAM[] = ['5'];

export class Server {
  users = new Map<string, User>();
  games = {'5': new Game()};

  load(data: Map<string, string>) {
    let gameData = new Map<string, any>();
    for (let [key, value] of data) {
      let decoded: Object;
      try {
        decoded = JSON.parse(value);
        if (decoded.constructor !== Object) {
          continue;
        }

        if (key.startsWith('@')) {
          gameData.set(key, decoded);
        } else {
          let user = new User(key);
          user.load(decoded);
          this.users.set(key, user);
        }
      } catch (e) {}
    }
    for (let team of TEAMS) {
      if (gameData.has(`@${team}`)) {
        let map5 = gameData.get(`@${team}`);
        for (let key in map5) {
          let user = this.users.get(key);
          if (user) {
            user.groups[team].score = map5[key];
          }
        }
      }
      this.sortGame(team);
    }
  }
  sortGame(team: TEAM) {
    let entries = [...this.users.entries()];
    entries.sort(([, usera], [, userb]) => userb.groups[team].score - usera.groups[team].score);
    let groups = entries.map(([, user]) => user.groups[team]);
    this.games[team].groups = groups;
    for (let i = 0; i < groups.length; ++i) {
      groups[i].rank = i;
    }
  }
}
