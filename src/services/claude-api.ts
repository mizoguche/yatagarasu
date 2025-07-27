import { execa } from 'execa';
import logger from '../logger.js';

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

export async function* callClaude(prompt: string): AsyncGenerator<CaludeEvent> {
  logger.info(`Call Claude with prompt: ${prompt}`);

  const result = execa({
    input: '\n',
  })`devcontainer exec --workspace-folder . claude -p --verbose --output-format stream-json --dangerously-skip-permissions "${prompt}"`;

  for await (const line of result) {
    console.log(line);
    yield JSON.parse(line);
  }
}
