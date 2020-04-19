export class Battle {
  clan0: string;
  clan1: string;
  names0: string;
  names1: string;
  winner: string;
  time: number;
}

export class Group {
  names: string[];

  score: number;
  level: number;

  highestLevel: number;
  highestLevelTime: number;
  password: string;

  history: Map<number, Battle> = new Map<number, Battle>();

  constructor(public user: User) {}
}

export class User {
  clanName: string;
  lastChangeTime: number;
  group5 = new Group(this);
}

export class Game {
  groups: Group[];
}
