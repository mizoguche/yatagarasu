import { Args, Flags } from '@oclif/core';
import bolt from '@slack/bolt';
import logger from '../logger.js';
import { BaseCommand } from './base.js';
import { callClaude } from '../services/claude-api.js';

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
      const allowedUser = process.env.YATAGARASU_PROMPTER;

      if (allowedUser && event.user !== allowedUser) {
        await say(buildMessage('お前……誰だ……？', event.ts));
        return;
      }

      await say(buildMessage('ざわ……ざわ……', event.ts));

      try {
        const prompt = event.text.replace(/<@.*?>\s*/, '');
        for await (const ev of callClaude(prompt)) {
          switch (ev.type) {
            case 'assistant':
              for (const content of ev.message.content) {
                switch (content.type) {
                  case 'thinking':
                    await say(buildThinking(content.thinking, event.ts));
                    break;
                  case 'text':
                    await say(buildMessage(content.text, event.ts));
                    break;
                }
              }
              break;
            case 'system':
              await say(buildThinking(`モデル: ${ev.model}`, event.ts));
              break;
            case 'user':
              // コスパ悪いのでスキップ
              // for (const content of ev.message.content) {
              //   await say(buildThinking(content.content, event.ts));
              // }
              break;
            case 'result':
              // resultは最後に assistant の text として送られてくるものと同じなので完了したことだけ伝える
              await say(
                buildMessage(`<@${allowedUser}> :kan_owari:`, event.ts),
              );
              break;
          }
        }
      } catch (error) {
        logger.error('Failed to call Claude', error);
      }
    });

    await (async () => {
      await app.start(3000);
      logger.info('Serving on port 3000...');
    })();
  }
}

const buildThinking = (thinking: string, threadTs: string) => {
  return {
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '```\n' + thinking.substring(0, 2950) + '\n```',
        },
      },
    ],
    text: thinking,
    thread_ts: threadTs,
  };
};

const buildMessage = (message: string, threadTs: string) => {
  return {
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: message.substring(0, 2950),
        },
      },
    ],
    text: message,
    thread_ts: threadTs,
  };
};
