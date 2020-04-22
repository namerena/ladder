import {Game, User} from './Game';
import {FileStorage} from './Storage';
import {getUTC8Str, TenMinutes} from './util';
import {roundRun} from './Runner';

type TEAM = '1' | '2' | '5';
let TEAMS: TEAM[] = ['1', '2', '5'];

export class Server {
  users = new Map<string, User>();
  games = {'1': new Game(), '2': new Game(), '5': new Game()};

  constructor(public mainStorage: FileStorage, public logStorage: FileStorage) {
    this.load(mainStorage.init());
  }
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
      let group = groups[i];
      group.rank = i;
    }
  }
  saveScores(team: TEAM) {
    let groups = this.games[team].groups;

    let result: any = {};
    for (let i = 0; i < groups.length; ++i) {
      let group = groups[i];
      result[group.user.clanName] = group.score;
    }
    this.mainStorage.saveFile(`@${team}`, JSON.stringify(result));
  }

  start(delay: number = -1) {
    if (delay < 0) {
      let now = new Date().getTime();
      let nextTs = Math.ceil((now + 1) / TenMinutes) * TenMinutes;
      delay = nextTs - now;
    }

    setTimeout(this.nextRound, delay);
  }

  nextRound = async () => {
    let startTime = new Date().getTime();
    let startTstr = getUTC8Str(startTime);
    let roundsIdx = Math.round(startTime / TenMinutes);
    let team: TEAM = TEAMS[roundsIdx % 3];
    try {
      await roundRun(this.games[team], startTime, startTstr);
      this.sortGame(team);
      this.saveScores(team);
    } catch (e) {
      console.log(e);
    }

    let endTime = new Date().getTime();
    console.log(`${startTstr} : ${team}人组对战，持续${(endTime - startTime) / 1000}秒`);
    if (endTime - startTime >= TenMinutes) {
      this.start(0);
    } else {
      this.start();
    }
  };
}
