const namerena = require('./namerenaRun.dart.js');

export class Battle {
  static counter = 0;
  winner: string;

  constructor(public group0: GroupSnapshot, public group1: GroupSnapshot, public tstr: string) {
    group0.battles.add(this);
    group1.battles.add(this);
  }

  run() {
    let names = `${this.group0.clanName}\n${this.group0.names}\n\n${this.group1.clanName}\n${this.group1.names}\n\nseed:${this.tstr}@!`;
    let winner = namerena.run(names);
    if (winner === 0) {
      this.winner = this.group0.clanName;
    } else {
      this.winner = this.group1.clanName;
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

  constructor(public user: User) {}

  save() {
    return {
      names: this.names,
    };
  }
  load(data: any) {
    this.names = data.names;
  }
}

export class GroupSnapshot {
  rank: number;
  clanName: string;
  names: string;
  user: User;

  battles: Set<Battle> = new Set<Battle>();
  constructor(public origin: Group, tstr: string) {
    this.user = origin.user;
    this.clanName = origin.user.clanName;
    this.rank = origin.rank;
    this.names = origin.names;
    origin.history.set(tstr, this);
  }
}

export class User {
  lastChangeTime: number;
  password: string;
  duplicate: boolean;
  changes = 0;

  groups = {'1': new Group(this), '2': new Group(this), '5': new Group(this)};

  constructor(public clanName: string) {}

  load(data: any) {
    this.password = data.password;
    this.lastChangeTime = data.lastChangeTime;
    this.duplicate = data.duplicate;
    this.changes = data.changes;
    this.groups['1'].load(data['1']);
    this.groups['2'].load(data['2']);
    this.groups['5'].load(data['5']);
  }

  save() {
    return {
      'password': this.password,
      'lastChangeTime': this.lastChangeTime,
      'duplicate': this.duplicate,
      'changes': this.changes,
      '1': this.groups['1'].save(),
      '2': this.groups['2'].save(),
      '5': this.groups['5'].save(),
    };
  }
}

export class Game {
  groups: Group[];

  save() {}
}
