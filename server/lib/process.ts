import { spawn } from 'node:child_process';
import path from 'node:path';

/** Hard cap for collected stdout (ffprobe JSON is a few KB). */
const MAX_STDOUT_BYTES = 4 * 1024 * 1024;

export class ProcessError extends Error {
  constructor(
    message: string,
    /** "ENOENT" when the binary itself could not be found. */
    public readonly code: string | null = null,
  ) {
    super(message);
    this.name = 'ProcessError';
  }
}

export interface RunOptions {
  timeoutMs: number;
  signal?: AbortSignal;
  /** Keep stdout and resolve with it. */
  captureStdout?: boolean;
  /** Called for every complete line written to stdout. */
  onLine?: (line: string) => void;
}

/** Runs a binary without a shell. Resolves with stdout; rejects on a non-zero exit, timeout or abort. */
export function runProcess(command: string, args: string[], options: RunOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    if (options.signal?.aborted) {
      reject(new ProcessError('Cancelled.'));
      return;
    }
    const name = path.basename(command);
    const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
    const stdout: Buffer[] = [];
    let stdoutBytes = 0;
    let stderr = '';
    let partialLine = '';
    let settled = false;

    const finish = (error: ProcessError | null, output = '') => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      options.signal?.removeEventListener('abort', onAbort);
      if (error) reject(error);
      else resolve(output);
    };
    const stop = (reason: string) => {
      child.kill('SIGKILL');
      finish(new ProcessError(reason));
    };
    const onAbort = () => stop('Cancelled.');
    const timer = setTimeout(() => stop(name + ' took too long and was stopped.'), options.timeoutMs);
    options.signal?.addEventListener('abort', onAbort, { once: true });

    child.stdout.on('data', (chunk: Buffer) => {
      if (options.captureStdout) {
        stdoutBytes += chunk.length;
        if (stdoutBytes > MAX_STDOUT_BYTES) return stop(name + ' printed too much output.');
        stdout.push(chunk);
      }
      if (options.onLine) {
        const lines = (partialLine + chunk.toString('utf8')).split('\n');
        partialLine = lines.pop() ?? '';
        for (const line of lines) options.onLine(line.trim());
      }
    });
    child.stderr.on('data', (chunk: Buffer) => {
      stderr = (stderr + chunk.toString('utf8')).slice(-4000);
    });
    child.on('error', (error: NodeJS.ErrnoException) => {
      finish(new ProcessError(name + ': ' + error.message, error.code ?? null));
    });
    child.on('close', (code, signal) => {
      if (code === 0) finish(null, Buffer.concat(stdout).toString('utf8'));
      else
        finish(new ProcessError(name + ' failed (' + (code ?? signal) + '): ' + stderr.trim().slice(-600)));
    });
  });
}
