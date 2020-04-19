import { Game, User } from "./Game";

export class Server {
  users = new Map<string, User>();
  game5: Game;
}
