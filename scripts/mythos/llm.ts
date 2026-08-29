import { execFile } from 'node:child_process';

export type CallLlm = (system: string, user: string) => Promise<string>;

export type CliResult = { stdout: string; stderr: string; code: number };

/** Injectable so tests never spawn a real process. */
export type CliRunner = (args: string[], stdin: string) => Promise<CliResult>;

export type ClaudeCliOpts = {
  model: string;
  bin?: string;
  timeoutMs?: number;
  maxBuffer?: number;
  run?: CliRunner;
};

const DEFAULT_TIMEOUT_MS = 180_000;
const DEFAULT_MAX_BUFFER = 10 * 1024 * 1024;

/**
 * Text generation through the Claude Code CLI rather than the Anthropic SDK, so
 * the tracker bills a Claude subscription (CLAUDE_CODE_OAUTH_TOKEN) instead of
 * API credits. Same `(system, user) => text` contract renderPost already
 * depends on, so its retry/validation loop is unchanged.
 *
 * Throws on any non-success outcome — renderPost treats a throw as a failed
 * attempt and retries, and surfaces the message when it runs out of attempts.
 */
export function claudeCliCallLlm(opts: ClaudeCliOpts): CallLlm {
  const run = opts.run ?? nodeRunner(opts);
  return async (system, user) => {
    const args = [
      '-p',
      // Pure text generation: strip the tool-running built-ins.
      '--restricted',
      '--output-format',
      'json',
      '--model',
      opts.model,
      '--append-system-prompt',
      system,
    ];

    const { stdout, stderr, code } = await run(args, user);
    if (code !== 0) {
      throw new Error(`claude CLI exited ${code}: ${(stderr || stdout).trim() || '(no output)'}`);
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(stdout);
    } catch {
      throw new Error(`could not parse claude CLI output as JSON: ${stdout.slice(0, 200)}`);
    }

    const payload = parsed as { is_error?: boolean; result?: unknown; subtype?: string };
    if (payload.is_error) {
      throw new Error(
        `claude CLI reported an error (${payload.subtype ?? 'unknown'}): ${String(payload.result ?? '')}`,
      );
    }
    if (typeof payload.result !== 'string' || payload.result.length === 0) {
      throw new Error(`claude CLI returned no result text: ${stdout.slice(0, 200)}`);
    }
    return payload.result;
  };
}

function nodeRunner(opts: ClaudeCliOpts): CliRunner {
  return (args, stdin) =>
    new Promise((resolve, reject) => {
      const child = execFile(
        opts.bin ?? 'claude',
        args,
        {
          timeout: opts.timeoutMs ?? DEFAULT_TIMEOUT_MS,
          maxBuffer: opts.maxBuffer ?? DEFAULT_MAX_BUFFER,
        },
        (err, stdout, stderr) => {
          // execFile reports a non-zero exit as an error carrying `code`; that
          // is a normal result here, not a spawn failure.
          if (err && typeof (err as { code?: unknown }).code !== 'number') {
            reject(err);
            return;
          }
          resolve({ stdout, stderr, code: (err as { code?: number } | null)?.code ?? 0 });
        },
      );
      child.stdin?.end(stdin);
    });
}
