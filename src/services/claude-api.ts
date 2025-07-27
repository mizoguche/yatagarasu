import { execa } from 'execa';
import type { CaludeEvent } from '../commands/serve.js';

export async function* callClaude(prompt: string): AsyncGenerator<CaludeEvent> {
  const args = [
    'devcontainer',
    'exec',
    '--workspace-folder',
    '.',
    'claude',
    '-p',
    '--verbose',
    '--output-format',
    'stream-json',
    '--dangerously-skip-permissions',
    prompt,
  ];

  const process = execa(args[0], args.slice(1), {
    stdin: 'pipe',
  });

  process.stdin?.write('\n');
  process.stdin?.end();

  if (!process.stdout) {
    throw new Error('No stdout stream available');
  }

  for await (const line of process.stdout) {
    const trimmedLine = line.toString().trim();
    if (trimmedLine) {
      yield JSON.parse(trimmedLine);
    }
  }
}
