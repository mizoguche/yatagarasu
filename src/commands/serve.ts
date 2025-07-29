import { Args, Flags } from '@oclif/core';
import bolt from '@slack/bolt';
import logger from '../logger.js';
import { BaseCommand } from './base.js';
import { callClaude } from '../services/claude-api.js';
import { promises as fs } from 'fs';
import path from 'path';

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
    const { flags } = await this.parse(Serve);
    if (flags.verbose) {
      logger.info('--verbose is set');
    }

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
        const textWithoutMention = event.text.replace(/<@.*?>\s*/, '');

        let finalPrompt = textWithoutMention;

        if (textWithoutMention.startsWith('/')) {
          const [commandPart, ...argsParts] = textWithoutMention.split(/\s+/);
          const commandName = commandPart.substring(1);
          const args = argsParts.join(' ');

          const commandFilePath = path.join(
            process.cwd(),
            '.claude',
            'commands',
            `${commandName}.md`,
          );

          try {
            const commandContent = await fs.readFile(commandFilePath, 'utf-8');
            finalPrompt = commandContent.replace(/\$ARGUMENTS/g, args);
            logger.info(
              `Executing slash command: /${commandName} with args: ${args}`,
            );
          } catch {
            await say(
              buildMessage(
                `コマンド \`/${commandName}\` が見つからない……！`,
                event.ts,
              ),
            );
            return;
          }
        }

        for await (const ev of callClaude(finalPrompt)) {
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
              if (flags.verbose) {
                for (const content of ev.message.content) {
                  if (typeof content.content === 'string') {
                    await say(buildThinking(content.content, event.ts));
                  } else if (typeof content.text === 'string') {
                    await say(buildThinking(content.text, event.ts));
                  }
                }
              }
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
