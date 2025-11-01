import { describe, expect, it, vi } from 'vitest';
import {
  ensureSupportedNodeVersion,
  formatUnsupportedNodeMessage,
  isNodeVersionSupported,
} from '../../src/utils/runtime.utils.js';

describe('Unit: runtime.utils', () => {
  it('recognises supported Node.js versions', () => {
    expect(isNodeVersionSupported('18.0.0')).toBe(true);
    expect(isNodeVersionSupported('20.11.1')).toBe(true);
  });

  it('rejects unsupported Node.js versions', () => {
    expect(isNodeVersionSupported('16.20.2')).toBe(false);
    expect(isNodeVersionSupported('foo')).toBe(false);
  });

  it('formatUnsupportedNodeMessage guides the user to upgrade', () => {
    const message = formatUnsupportedNodeMessage('v16.20.2');
    expect(message).toContain('requires Node.js 18 or newer');
    expect(message).toContain('Detected v16.20.2');
    expect(message).toContain('nvm install 18 && nvm use 18');
  });

  it('ensureSupportedNodeVersion returns true for supported runtimes', () => {
    const log = vi.fn();
    const exit = vi.fn();

    const result = ensureSupportedNodeVersion({
      currentVersion: '18.19.0',
      displayVersion: 'v18.19.0',
      log,
      exit,
    });

    expect(result).toBe(true);
    expect(log).not.toHaveBeenCalled();
    expect(exit).not.toHaveBeenCalled();
  });

  it('ensureSupportedNodeVersion logs and exits for unsupported runtimes', () => {
    const log = vi.fn();
    const exit = vi.fn();

    ensureSupportedNodeVersion({
      currentVersion: '16.20.0',
      displayVersion: 'v16.20.0',
      log,
      exit,
    });

    expect(log).toHaveBeenCalledWith(
      formatUnsupportedNodeMessage('v16.20.0')
    );
    expect(exit).toHaveBeenCalledWith(1);
  });
});
