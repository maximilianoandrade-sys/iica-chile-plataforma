import { trackEvent } from '@/lib/analytics';

describe('analytics mapping', () => {
  const realFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true }) as unknown as typeof global.fetch;
  });

  afterEach(() => {
    global.fetch = realFetch;
  });

  it('maps click_outbound_link to link_click event', async () => {
    trackEvent({ action: 'click_outbound_link', category: 'Outbound', label: 'Bases: Test' });
    await Promise.resolve();

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/analytics',
      expect.objectContaining({ method: 'POST' }),
    );

    const [, init] = (global.fetch as jest.Mock).mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(String(init.body));
    expect(body.event).toBe('link_click');
  });
});
