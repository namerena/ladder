import crypto from 'crypto';
import {Battle, Game, GroupSnapshot, User} from './Game';
import {FileStorage} from './Storage';
import {getUTC8Str, TEAM, TEAMS, TenMinutes} from './util';
import {roundRun} from './Runner';
import {validateNameChange} from './validator';
import * as zlib from 'zlib';

export class Server {
  requestCount = 0;

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
      result[group.user.clan] = group.score;
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
    this.updateIndexPage(
      `${startTstr} : ${team}人组对战${Battle.counter}场，耗时${(endTime - startTime) / 1000}秒，最近收到${
        this.requestCount
      }个请求`
    );
    Battle.counter = 0;
    if (endTime - startTime >= TenMinutes) {
      this.start(0);
    } else {
      this.start();
    }
  };

  log(str: string) {
    console.log(str);
  }

  indexPage: Buffer;

  lastMessages: string[] = [`${getUTC8Str(new Date().getTime(), 1)} ： 服务器重新启动`];
  updateIndexPage(lastMessage: string) {
    while (this.lastMessages.length > 36) {
      this.lastMessages.shift();
    }
    this.lastMessages.push(lastMessage);
    let result: any = {lastMessages: this.lastMessages};
    for (let t of TEAMS) {
      let groups = this.games[t].groups;
      let topN = Math.min(groups.length, 100);
      let teams: any[] = [];
      for (let i = 0; i < topN; ++i) {
        let group = groups[i];
        teams.push({
          c: group.user.clan,
          n: group.names,
          s: Math.round(group.score),
        });
      }
      result[t] = teams;
    }
    const buf = Buffer.from(JSON.stringify(result), 'utf-8'); // Choose encoding for the string.
    zlib.gzip(buf, (_: Error, result: Buffer) => {
      this.indexPage = result;
    });
    this.log(lastMessage);
  }

  updateUser(data: any) {
    ++this.requestCount;
    let validateResult = validateNameChange(data);
    if (typeof validateResult === 'string') {
      return validateResult;
    }

    let {clan, names, password, create} = validateResult;
    password = crypto.createHash('sha256').update(password, 'utf8').digest('base64');
    let duplicate = new Set(names).size < 8;
    let user = this.users.get(clan);
    if (user) {
      if (create) {
        return '用户已存在';
      }
      if (user.password !== password) {
        if (!user.password) {
          user.password = password;
        } else {
          return '密码错误';
        }
      }
    } else {
      if (!create) {
        return '用户不存在';
      }
      user = new User(clan);
      user.password = password;
      this.users.set(clan, user);
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
    this.mainStorage.saveFile(clan, JSON.stringify(user.save()));
    return '';
  }

  getUser(clan: string) {
    ++this.requestCount;
    let user = this.users.get(clan);
    if (user) {
      let result: any = {clan, lastChangeTime: user.lastChangeTime, changes: user.changes};
      for (let t of TEAMS) {
        let group = user.groups[t];
        let ranks: any[] = [];
        let tdata: any = {names: group.names, score: group.score, ranks};
        let rank = group.rank;
        let r0 = Math.max(rank - 5, 0);
        let r1 = Math.min(rank + 5, this.games[t].groups.length - 1);
        for (let i = r0; i <= r1; ++i) {
          ranks.push([i, this.games[t].groups[i].user.clan]);
        }
        result[t] = tdata;
      }
      return result;
    }
    return '';
  }
  getUserHistory(clan: string, team: TEAM) {
    ++this.requestCount;
    let user = this.users.get(clan);
    if (user) {
      let group = user.groups[team];
      let result: any = {clan};
      for (let [key, snapshot] of group.history) {
        let battles: any[] = [];
        let snapshotData = {names: snapshot.names, rank: snapshot.rank, battles};
        for (let battle of snapshot.battles) {
          let battleData: any = {};
          let targetGroup: GroupSnapshot;
          if (battle.group0 === snapshot) {
            targetGroup = battle.group1;
          } else {
            targetGroup = battle.group0;
          }
          battleData.clan = targetGroup.clan;
          battleData.names = targetGroup.names;
          battleData.rank = targetGroup.rank;
          battleData.win = battle.winner === clan;
          battles.push(battleData);
        }
        result[key] = snapshotData;
      }
      return result;
    }
    return {};
  }
}
