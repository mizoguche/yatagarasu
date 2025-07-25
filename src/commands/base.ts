import { Command, Flags } from '@oclif/core';
import logger, { setLogLevel } from '../logger.js';

export abstract class BaseCommand extends Command {
  static baseFlags = {
    verbose: Flags.boolean({
      char: 'v',
      description: 'enable verbose logging',
      default: false,
    }),
  };

  async init(): Promise<void> {
    await super.init();
    const { flags } = await this.parse(this.constructor as typeof BaseCommand);

    if (flags.verbose) {
      setLogLevel('debug');
      logger.debug('Verbose mode enabled');
    }
  }
}
