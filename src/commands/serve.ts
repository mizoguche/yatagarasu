import { Args, Flags } from '@oclif/core';
import bolt from '@slack/bolt';
import logger from '../logger.js';
import { BaseCommand } from './base.js';

const { App } = bolt;

export default class Serve extends BaseCommand {
  static override args = {
    file: Args.string({ description: 'file to read' }),
  };
  static override description = 'describe the command here';
  static override examples = ['<%= config.bin %> <%= command.id %>'];
  static override flags = {
    ...BaseCommand.baseFlags,
    // flag with no value (-f, --force)
    force: Flags.boolean({ char: 'f' }),
    // flag with a value (-n, --name=VALUE)
    name: Flags.string({ char: 'n', description: 'name to print' }),
  };

  public async run(): Promise<void> {
    // const { args, flags } = await this.parse(Serve);

    const app = new App({
      token: process.env.SLACK_BOT_TOKEN,
      appToken: process.env.SLACK_APP_TOKEN,
      socketMode: true,
    });

    app.event('app_mention', async ({ event, say }) => {
      logger.info(`Received an event: ${JSON.stringify(event)}`);
      if (!event.text.includes('hello')) {
        return;
      }

      await say({
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `Hello, **<@${event.user}>!**`,
            },
          },
        ],
        text: `Hello, <@${event.user}>!`,
        thread_ts: event.ts,
      });
    });

    await (async () => {
      await app.start(3000);
      logger.info('Serving on port 3000...');
    })();
  }
}
