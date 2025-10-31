import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import hello from '../../src/commands/hello.js';

describe('E2E: Hello Command', () => {
  const testDir = 'test-hello';
  const testPath = path.join(process.cwd(), testDir);
  let originalCwd;

  beforeEach(() => {
    // Create a temporary directory for the test
    if (!fs.existsSync(testPath)) {
      fs.mkdirSync(testPath);
    }
    originalCwd = process.cwd();
    process.chdir(testPath);

    process.env.RESEND_API_KEY = 're_dummy_key';

    // Mock console methods to avoid cluttering test output
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});

    // Mock process.stderr.write for ora spinners
    vi.spyOn(process.stderr, 'write').mockImplementation(() => {});
  });

  afterEach(() => {
    // Cleanup: remove test directory
    process.chdir(originalCwd);
    if (fs.existsSync(testPath)) {
      fs.rmSync(testPath, { recursive: true, force: true });
    }
    vi.restoreAllMocks();
  });

  it('should run a demo dry-run', async () => {
    await hello();

    const consoleOutput = vi.mocked(console.log).mock.calls.flat().join('\n');
    expect(consoleOutput).toContain('Running a demo dry-run...');
    expect(consoleOutput).toContain('DRY RUN - Preview');
    expect(consoleOutput).toContain('Do you like cookies?');
    expect(consoleOutput).toContain('emails scheduled');
    expect(consoleOutput).toContain('VAR-A=1');
    expect(consoleOutput).toContain('VAR-B=1');
  });
});
