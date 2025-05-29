import { Client, Collection } from 'discord.js';


export interface CustomClientType extends Client {
  commands: Collection<any, any>;
  cooldowns: Collection<any, any>;
}


export class CustomClient extends Client {
  commands: Collection<any, any>;
  cooldowns: Collection<any, any>;

  constructor(options: any) {
    super(options);
    this.commands = new Collection();
    this.cooldowns = new Collection();
  }
}