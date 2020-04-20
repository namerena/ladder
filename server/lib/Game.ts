export class Battle {
  winner: string;

  constructor(public group0: Group, public group1: Group, public time: number) {}
}

export class Group {
  score: number;
  rank: number;

  history: Map<number, Battle> = new Map<number, Battle>();
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

  groups = {'5': new Group(this)};

  constructor(public clanName: string) {}

  load(data: any) {
    this.clanName = data.clanName;
    this.password = data.password;
    this.lastChangeTime = data.lastChangeTime;
    this.groups['5'].load(data['5']);
  }

  save() {
    return {
      clanName: this.clanName,
      password: this.password,
      lastChangeTime: this.lastChangeTime,
      5: this.groups['5'].save(),
    };
  }
}

export class Game {
  groups: Group[];

  save() {}
}
