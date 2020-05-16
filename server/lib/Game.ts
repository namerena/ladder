import {OneDay, ThirtyDays} from './util';

const namerena = require('./namerenaRun.dart.js');

export class Battle {
  static counter = 0;
  winner: string;

  constructor(public group0: GroupSnapshot, public group1: GroupSnapshot, public tstr: string) {
    group0.battles.add(this);
    group1.battles.add(this);
  }

  run() {
    let names = `${this.group0.clan}\n${this.group0.names}\n\n${this.group1.clan}\n${this.group1.names}\n\nseed:${this.tstr}@!`;
    let winner = namerena.run(names);
    if (winner === 0) {
      this.winner = this.group0.clan;
    } else {
      this.winner = this.group1.clan;
    }
    ++Battle.counter;
  }
}

export class Group {
  // 新人注册就有1000分
  score: number = 1000;
  rank: number;

  history = new Map<string, GroupSnapshot>();
  names: string;

  constructor(public user: User) {
  }

  save() {
    return {
      names: this.names,
    };
  }

  load(data: any) {
    this.names = data.names;
  }

  addHistory(tstr: string, snapshot: GroupSnapshot) {
    if (this.history.size > 52) {
      let yesterday = new Date(new Date(tstr + 'Z').getTime() - OneDay).toISOString().substring(0, 19);
      for (let [t, g] of this.history) {
        if (t <= yesterday) {
          this.history.delete(t);
        }
      }
    }
    this.history.set(tstr, snapshot);
  }
}

export class GroupSnapshot {
  rank: number;
  score: number;
  clan: string;
  names: string;
  user: User;

  battles: Set<Battle> = new Set<Battle>();

  constructor(public origin: Group, tstr: string) {
    this.user = origin.user;
    this.clan = origin.user.clan;
    this.rank = origin.rank;
    this.score = Math.round(origin.score);
    this.names = origin.names;
    origin.addHistory(tstr, this);
  }
}

export class User {
  lastChangeTime: number;
  password: string;
  changes = 0;

  groups = {'1': new Group(this), '2': new Group(this), '5': new Group(this)};

  constructor(public clan: string) {
  }

  load(data: any) {
    this.password = data.password;
    this.lastChangeTime = data.lastChangeTime;
    this.changes = data.changes;
    this.groups['1'].load(data['1']);
    this.groups['2'].load(data['2']);
    this.groups['5'].load(data['5']);
  }

  save() {
    return {
      'password': this.password,
      'lastChangeTime': this.lastChangeTime,
      'changes': this.changes,
      '1': this.groups['1'].save(),
      '2': this.groups['2'].save(),
      '5': this.groups['5'].save(),
    };
  }
}

export class Game {

  groups: Group[];
  tense: number;
  rate: number
  fadeRate: number;

  save() {
  }


  constructor(public size: number) {
    this.tense = [1, 7, 5, 1, 1, 4][size];
    this.rate = [1, 0.33, 0.5, 1, 1, 0.6][size];
    this.fadeRate = 1 - (10 - this.tense) / 1000;
  }
}
