import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import hello from '../../src/commands/hello.js';
import { SHARE_HINT_TEXT } from '../../src/constants/index.js';

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
    const beforeFiles = fs.readdirSync('.');
    await hello();
    const afterFiles = fs.readdirSync('.');

    const consoleOutput = vi.mocked(console.log).mock.calls.flat().join('\n');
    expect(consoleOutput).toContain('Coldr demo (scaffold preview)');
    expect(consoleOutput).toContain('DRY RUN - Preview');
    expect(consoleOutput).toContain('Example Corp');
    expect(consoleOutput).toContain('Demo scheduled');
    expect(consoleOutput).toContain('Next steps for builders');
    expect(consoleOutput).toContain(SHARE_HINT_TEXT);
    expect(consoleOutput).toContain('jeremymoyson');

    expect(afterFiles).toEqual(beforeFiles);
  });
});
