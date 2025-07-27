import { Args, Flags } from '@oclif/core';
import bolt from '@slack/bolt';
import logger from '../logger.js';
import { BaseCommand } from './base.js';
import { callClaude } from '../services/claude-api.js';

const { App } = bolt;

type ToolName =
  | 'Task'
  | 'Bash'
  | 'Glob'
  | 'Grep'
  | 'LS'
  | 'ExitPlanMode'
  | 'Read'
  | 'Edit'
  | 'MultiEdit'
  | 'Write'
  | 'NotebookRead'
  | 'NotebookEdit'
  | 'WebFetch'
  | 'TodoWrite'
  | 'WebSearch';

type Usage = {
  input_tokens: number;
  cache_creation_input_tokens: number;
  cache_read_input_tokens: number;
  output_tokens: number;
  service_tier: string;
};

type ThinkingContent = {
  type: 'thinking';
  thinking: string;
  signature: string;
};

type TextContent = {
  type: 'text';
  text: string;
};

type ToolUseContent = {
  type: 'tool_use';
  id: string;
  name: ToolName;
  input: {
    file_path?: string;
    path?: string;
  };
};

type AssistantContent = ThinkingContent | TextContent | ToolUseContent;

type AssistantMessage = {
  id: string;
  type: 'message';
  role: 'assistant';
  model: string;
  content: AssistantContent[];
  stop_reason: string | null;
  stop_sequence: string | null;
  usage: Usage;
};

type AssistantEvent = {
  type: 'assistant';
  message: AssistantMessage;
  parent_tool_use_id: string | null;
  session_id: string;
};

type ToolResultContent = {
  type: 'tool_result';
  tool_use_id: string;
  content: string;
  is_error?: boolean;
};

type UserMessage = {
  role: 'user';
  content: ToolResultContent[];
};

type UserEvent = {
  type: 'user';
  message: UserMessage;
  parent_tool_use_id: string | null;
  session_id: string;
};

type SystemEvent = {
  type: 'system';
  subtype: string;
  cwd: string;
  session_id: string;
  tools: ToolName[];
  mcp_servers: any[]; // 中身が不明なためany[]
  model: string;
  permissionMode: string;
  apiKeySource: string;
};

type ResultUsage = Usage & {
  server_tool_use: {
    web_search_requests: number;
  };
};

type ResultEvent = {
  type: 'result';
  subtype: string;
  is_error: boolean;
  duration_ms: number;
  duration_api_ms: number;
  num_turns: number;
  result: string;
  session_id: string;
  total_cost_usd: number;
  usage: ResultUsage;
};

export type CaludeEvent =
  | SystemEvent
  | AssistantEvent
  | UserEvent
  | ResultEvent;

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
      await say(buildMessage('ざわ……ざわ……', event.ts));

      try {
        for await (const ev of callClaude(event.text)) {
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
              // 最後に assistant の text として送られてくるものと同じなのでスキップ
              // await say(buildMessage(ev.result, event.ts));
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
          text: '```\n' + thinking.substring(0, 2900) + '\n```',
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
          text: message.substring(0, 2900),
        },
      },
    ],
    text: message,
    thread_ts: threadTs,
  };
};
