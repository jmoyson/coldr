import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import init from '../../src/commands/init.js';
import schedule from '../../src/commands/schedule.js';

describe('E2E: One-Liner', () => {
  const testDir = 'test-one-liner';
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

  it('should init and schedule with a dry-run', async () => {
    // 1. Init campaign in current directory
    init('.');

    // 2. Create a dummy leads.csv for testing variants
    const leadsCsv = `email,name,company,variant,subject
alice@domain.com,Alice,Domain Inc,var-a,Custom Subject A\nbob@domain.com,Bob,Domain Inc,var-b,Custom Subject B`;
    fs.writeFileSync('leads.csv', leadsCsv);

    // 3. Run schedule with dry-run
    await schedule('.', { dryRun: true });

    // 4. Assert that leads.csv was updated
    const updatedCsv = fs.readFileSync('leads.csv', 'utf-8');
    expect(updatedCsv).toContain('scheduled_at');
    expect(updatedCsv).toContain('status');
    expect(updatedCsv).toContain('resend_id');

    const { data: parsedRows } = Papa.parse(updatedCsv, {
      header: true,
      skipEmptyLines: true,
    });

    parsedRows.forEach((row) => {
      expect(row.scheduled_at).toMatch(/T\d{2}:\d{2}:/);
      expect(row.status).toBe('scheduled');
      expect(row.resend_id).toBe('dry-run');
    });

    // 5. Assert that the dry-run output contains variant info
    const consoleOutput = vi.mocked(console.log).mock.calls.flat().join('\n');
    expect(consoleOutput).toContain('VAR-A');
    expect(consoleOutput).toContain('Custom Subject A');
    expect(consoleOutput).toContain('VAR-B');
    expect(consoleOutput).toContain('Custom Subject B');
    expect(consoleOutput).toContain('emails scheduled');
    expect(consoleOutput).toContain('VAR-A=1');
    expect(consoleOutput).toContain('VAR-B=1');
  });
});
