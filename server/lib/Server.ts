import crypto from 'crypto';
import {Battle, Game, User} from './Game';
import {FileStorage} from './Storage';
import {getUTC8Str, TenMinutes} from './util';
import {roundRun} from './Runner';
import {validateNameChange} from './validator';
import * as zlib from 'zlib';

type TEAM = '1' | '2' | '5';
export const TEAMS: TEAM[] = ['1', '2', '5'];

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
    this.updateIndexPage(`${startTstr} : ${team}人组对战${Battle.counter}场，持续${(endTime - startTime) / 1000}秒`);
    Battle.counter = 0;
    if (endTime - startTime >= TenMinutes) {
      this.start(0);
    } else {
      this.start();
    }
  };

  indexPage: Buffer;
  updateIndexPage(lastMessage: string) {
    let result: any = {lastMessage};
    for (let t of TEAMS) {
      let groups = this.games[t].groups;
      let topN = Math.min(groups.length, 100);
      let teams: any[] = [];
      for (let i = 0; i < topN; ++i) {
        let group = groups[i];
        teams.push({
          c: group.user.clanName,
          n: group.names,
          s: Math.round(group.score),
        });
      }
      result[t] = teams;
    }
    const buf = new Buffer(JSON.stringify(result), 'utf-8'); // Choose encoding for the string.
    zlib.gzip(buf, (_: Error, result: Buffer) => {
      this.indexPage = result;
    });
  }

  updateUser(data: any) {
    let {clanName, names, password} = validateNameChange(data);
    if (clanName == null || names.length < 5) {
      return '非法输入';
    }
    password = crypto.createHash('sha256').update(password, 'utf8').digest('base64');
    let duplicate = new Set(names).size < 8;
    let user = this.users.get(clanName);
    if (user) {
      if (user.password !== password) {
        if (!user.password) {
          user.password = password;
        } else {
          return '非法输入';
        }
      }
    } else {
      user = new User(clanName);
      user.password = password;
      this.users.set(clanName, user);
      for (let t of TEAMS) {
        user.groups[t].rank = this.users.size - 1;
        this.games[t].groups.push(user.groups[t]);
      }
    }

    user.changes++;
    user.lastChangeTime = new Date().getTime();
    user.duplicate = duplicate;
    user.groups['1'].names = names[0];
    user.groups['2'].names = `${names[1]}\n${names[2]}`;
    user.groups['5'].names = names.slice(names.length - 5).join('\n');
    this.mainStorage.saveFile(clanName, JSON.stringify(user.save()));
    return '';
  }

  getUser(clanName: string): string {
    let result: any = {
    };
  }
  getUserHistory(clanName: string, team: TEAM): string {}
}
