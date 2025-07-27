import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { callClaude } from './claude-api.js';
import { execa } from 'execa';
import { Readable } from 'stream';

vi.mock('execa');

describe('callClaude', () => {
  let mockExeca: Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    mockExeca = vi.mocked(execa) as unknown as Mock;
  });

  it('should yield parsed JSON events from Claude API', async () => {
    const mockEvents = [
      { type: 'system', model: 'claude-3' },
      {
        type: 'assistant',
        message: { content: [{ type: 'text', text: 'Hello' }] },
      },
      { type: 'result', result: 'Done' },
    ];

    const mockLines = mockEvents.map((event) => JSON.stringify(event));

    const mockStdout = new Readable({
      read() {
        if (mockLines.length > 0) {
          this.push(mockLines.shift() + '\n');
        } else {
          this.push(null);
        }
      },
    });

    const mockStdin = {
      write: vi.fn(),
      end: vi.fn(),
    };

    const mockProcess = {
      stdout: mockStdout,
      stdin: mockStdin,
    };

    mockExeca.mockReturnValue(mockProcess);

    const events = [];
    for await (const event of callClaude('test prompt')) {
      events.push(event);
    }

    expect(events).toEqual(mockEvents);
    expect(mockExeca).toHaveBeenCalledWith(
      'devcontainer',
      [
        'exec',
        '--workspace-folder',
        '.',
        'claude',
        '-p',
        '--verbose',
        '--output-format',
        'stream-json',
        '--dangerously-skip-permissions',
        'test prompt',
      ],
      { stdin: 'pipe' },
    );
    expect(mockStdin.write).toHaveBeenCalledWith('\n');
    expect(mockStdin.end).toHaveBeenCalled();
  });

  it('should pass the prompt to Claude command', async () => {
    const mockStdout = new Readable({
      read() {
        this.push(JSON.stringify({ type: 'system' }) + '\n');
        this.push(null);
      },
    });

    const mockStdin = {
      write: vi.fn(),
      end: vi.fn(),
    };

    const mockProcess = {
      stdout: mockStdout,
      stdin: mockStdin,
    };

    mockExeca.mockReturnValue(mockProcess);

    const prompt = 'Hello Claude';
    const events = [];
    for await (const event of callClaude(prompt)) {
      events.push(event);
    }

    expect(mockExeca).toHaveBeenCalledWith(
      'devcontainer',
      expect.arrayContaining(['Hello Claude']),
      { stdin: 'pipe' },
    );
  });

  it('should throw error when stdout is not available', async () => {
    const mockProcess = {
      stdout: null,
      stdin: {
        write: vi.fn(),
        end: vi.fn(),
      },
    };

    mockExeca.mockReturnValue(mockProcess);

    const generator = callClaude('test');
    await expect(generator.next()).rejects.toThrow(
      'No stdout stream available',
    );
  });
});
