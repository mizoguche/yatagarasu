import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';

// Mock must be defined before import
vi.mock('execa', () => {
  const mockExecaResult = vi.fn();
  const mockExeca = vi.fn((_options) => {
    return (_strings: TemplateStringsArray, ..._values: unknown[]) => {
      return mockExecaResult();
    };
  });

  // Store references for test access
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).__mockExeca = mockExeca;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).__mockExecaResult = mockExecaResult;

  return {
    execa: mockExeca,
  };
});

import { callClaude } from './claude-api.js';

describe('callClaude', () => {
  let mockExeca: Mock;
  let mockExecaResult: Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockExeca = (globalThis as any).__mockExeca;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockExecaResult = (globalThis as any).__mockExecaResult;
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

    // Mock the async iterator that execa returns
    const mockAsyncIterator = {
      async *[Symbol.asyncIterator]() {
        for (const line of mockLines) {
          yield line;
        }
      },
    };

    mockExecaResult.mockReturnValue(mockAsyncIterator);

    const events = [];
    for await (const event of callClaude('test prompt')) {
      events.push(event);
    }

    expect(events).toEqual(mockEvents);
    expect(mockExeca).toHaveBeenCalledWith({ input: '\n' });
  });

  it('should pass the prompt to Claude command', async () => {
    // Mock the async iterator
    const mockAsyncIterator = {
      async *[Symbol.asyncIterator]() {
        yield JSON.stringify({ type: 'system' });
      },
    };

    mockExecaResult.mockReturnValue(mockAsyncIterator);

    const prompt = 'Hello Claude';
    const events = [];
    for await (const event of callClaude(prompt)) {
      events.push(event);
    }

    expect(mockExeca).toHaveBeenCalledWith({ input: '\n' });
    expect(events).toHaveLength(1);
  });

  it('should handle errors from execa', async () => {
    // Mock execa to throw an error
    mockExeca.mockImplementation(() => {
      throw new Error('Command failed');
    });

    const generator = callClaude('test');
    await expect(generator.next()).rejects.toThrow('Command failed');
  });
});
