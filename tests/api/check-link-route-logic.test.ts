describe('check-link response rules', () => {
  function deriveCheckLinkOutcome({
    status,
    redirectedToHome,
    originalIsHomepage,
  }: {
    status: number;
    redirectedToHome: boolean;
    originalIsHomepage: boolean;
  }) {
    const statusOk = status >= 200 && status < 400;
    const blockedByBotProtection = status === 403 || status === 429;
    const methodNotAllowed = status === 405;

    const isValid = (statusOk || blockedByBotProtection || methodNotAllowed) && !redirectedToHome && !originalIsHomepage;
    const reason = !isValid
      ? (redirectedToHome
          ? 'redirected_to_home'
          : originalIsHomepage
            ? 'homepage_url_not_specific'
            : `http_${status}`)
      : blockedByBotProtection
        ? 'blocked_by_bot_protection'
        : methodNotAllowed
          ? 'head_not_allowed'
          : 'ok';

    return { isValid, reason };
  }

  it('marks anti-bot 403 as valid with explicit reason', () => {
    expect(deriveCheckLinkOutcome({ status: 403, redirectedToHome: false, originalIsHomepage: false })).toEqual({
      isValid: true,
      reason: 'blocked_by_bot_protection',
    });
  });

  it('marks redirects to homepage as invalid', () => {
    expect(deriveCheckLinkOutcome({ status: 200, redirectedToHome: true, originalIsHomepage: false })).toEqual({
      isValid: false,
      reason: 'redirected_to_home',
    });
  });

  it('marks homepage URLs as invalid to force specific links', () => {
    expect(deriveCheckLinkOutcome({ status: 200, redirectedToHome: false, originalIsHomepage: true })).toEqual({
      isValid: false,
      reason: 'homepage_url_not_specific',
    });
  });

  function fallbackForAbortOnProtectedHost({
    isAbort,
    isBotProtectedHost,
    originalIsHomepage,
  }: {
    isAbort: boolean;
    isBotProtectedHost: boolean;
    originalIsHomepage: boolean;
  }) {
    if (isAbort && isBotProtectedHost && !originalIsHomepage) {
      return {
        isValid: true,
        reason: 'blocked_by_bot_protection',
      };
    }

    return {
      isValid: false,
      reason: 'network_error',
    };
  }

  it('treats timeout abort on bot-protected host as valid', () => {
    expect(
      fallbackForAbortOnProtectedHost({
        isAbort: true,
        isBotProtectedHost: true,
        originalIsHomepage: false,
      }),
    ).toEqual({
      isValid: true,
      reason: 'blocked_by_bot_protection',
    });
  });

  it('keeps abort on non-protected host as invalid', () => {
    expect(
      fallbackForAbortOnProtectedHost({
        isAbort: true,
        isBotProtectedHost: false,
        originalIsHomepage: false,
      }),
    ).toEqual({
      isValid: false,
      reason: 'network_error',
    });
  });

  it('does not auto-validate homepage URLs even if aborts', () => {
    expect(
      fallbackForAbortOnProtectedHost({
        isAbort: true,
        isBotProtectedHost: true,
        originalIsHomepage: true,
      }),
    ).toEqual({
      isValid: false,
      reason: 'network_error',
    });
  });

  function classifyBotProtection({
    status,
    reason,
  }: {
    status: number;
    reason?: string;
  }) {
    return reason === 'blocked_by_bot_protection' || status === 403 || status === 429;
  }

  it('classifies status 0 with blocked reason as bot-protected', () => {
    expect(classifyBotProtection({ status: 0, reason: 'blocked_by_bot_protection' })).toBe(true);
  });

  it('does not classify status 0 without reason as bot-protected', () => {
    expect(classifyBotProtection({ status: 0 })).toBe(false);
  });
});
