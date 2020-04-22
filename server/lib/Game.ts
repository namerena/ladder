const namerena = require('./namerenaRun.dart.js');

export class Battle {
  winner: string;
  clanName0: string;
  clanName1: string;
  names0: string;
  names1: string;

  constructor(group0: Group, group1: Group, public tstr: string, public ts: number) {
    this.clanName0 = group0.user.clanName;
    this.clanName1 = group1.user.clanName;
    this.names0 = group0.names;
    this.names1 = group1.names;
    group0.history.add(this);
    group1.history.add(this);
  }

  run() {
    let names = `${this.clanName0}\n${this.names0}\n\n${this.clanName1}\n${this.names1}\n\nseed:${this.tstr}@!`;
    let winner = namerena.run(names);
    if (winner === 0) {
      this.winner = this.clanName0;
    } else {
      this.winner = this.clanName1;
    }
  }
}

export class Group {
  score: number = 0;
  rank: number;

  history: Set<Battle> = new Set<Battle>();
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

export class User {
  lastChangeTime: number;
  password: string;

  groups = {'1': new Group(this), '2': new Group(this), '5': new Group(this)};

  constructor(public clanName: string) {}

  load(data: any) {
    this.clanName = data.clanName;
    this.password = data.password;
    this.lastChangeTime = data.lastChangeTime;
    this.groups['1'].load(data['1']);
    this.groups['2'].load(data['2']);
    this.groups['5'].load(data['5']);
  }

  save() {
    return {
      'clanName': this.clanName,
      'password': this.password,
      'lastChangeTime': this.lastChangeTime,
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
