import { describe, expect, it } from 'vitest';
import { claudeCliCallLlm, type CliResult } from './llm';

const ok = (result: string): CliResult => ({
  stdout: JSON.stringify({ type: 'result', subtype: 'success', is_error: false, result }),
  stderr: '',
  code: 0,
});

describe('claudeCliCallLlm', () => {
  it('returns the result field on success', async () => {
    const callLlm = claudeCliCallLlm({
      model: 'claude-sonnet-4-6',
      run: async () => ok('body text'),
    });
    await expect(callLlm('sys', 'user')).resolves.toBe('body text');
  });

  it('invokes the CLI in restricted print mode with the system prompt and pipes user text on stdin', async () => {
    let seenArgs: string[] = [];
    let seenStdin = '';
    const callLlm = claudeCliCallLlm({
      model: 'claude-sonnet-4-6',
      run: async (args, stdin) => {
        seenArgs = args;
        seenStdin = stdin;
        return ok('x');
      },
    });
    await callLlm('SYSTEM', 'USER');

    expect(seenArgs).toContain('-p');
    // No tool use for a pure text generation call.
    expect(seenArgs).toContain('--restricted');
    expect(seenArgs).toContain('--output-format');
    expect(seenArgs).toContain('json');
    expect(seenArgs).toContain('--model');
    expect(seenArgs[seenArgs.indexOf('--model') + 1]).toBe('claude-sonnet-4-6');
    expect(seenArgs[seenArgs.indexOf('--append-system-prompt') + 1]).toBe('SYSTEM');
    expect(seenStdin).toBe('USER');
  });

  it('throws with stderr when the CLI exits non-zero (e.g. expired OAuth token)', async () => {
    const callLlm = claudeCliCallLlm({
      model: 'm',
      run: async () => ({ stdout: '', stderr: 'Invalid API key · Please run /login', code: 1 }),
    });
    await expect(callLlm('s', 'u')).rejects.toThrow(/Invalid API key/);
  });

  it('throws when the CLI reports is_error', async () => {
    const callLlm = claudeCliCallLlm({
      model: 'm',
      run: async () => ({
        stdout: JSON.stringify({
          type: 'result',
          subtype: 'error_during_execution',
          is_error: true,
          result: 'nope',
        }),
        stderr: '',
        code: 0,
      }),
    });
    await expect(callLlm('s', 'u')).rejects.toThrow(/nope/);
  });

  it('throws when stdout is not valid JSON', async () => {
    const callLlm = claudeCliCallLlm({
      model: 'm',
      run: async () => ({ stdout: 'not json', stderr: '', code: 0 }),
    });
    await expect(callLlm('s', 'u')).rejects.toThrow(/parse/i);
  });

  it('throws when the payload has no string result', async () => {
    const callLlm = claudeCliCallLlm({
      model: 'm',
      run: async () => ({
        stdout: JSON.stringify({ type: 'result', is_error: false }),
        stderr: '',
        code: 0,
      }),
    });
    await expect(callLlm('s', 'u')).rejects.toThrow(/result/i);
  });
});
