const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

interface ITurnstileResponse {
  success: boolean;
}

// the secret is passed in because a Worker reads it from its bindings (`env`), not from process.env
export async function verifyTurnstile(token: string, secret: string | undefined, remoteIp?: string): Promise<boolean> {
  if (!secret) {
    return false;
  }

  const body = new URLSearchParams({ secret, response: token });

  if (remoteIp) {
    body.set('remoteip', remoteIp);
  }

  const response = await fetch(VERIFY_URL, { method: 'POST', body });

  if (!response.ok) {
    return false;
  }

  const result = (await response.json()) as ITurnstileResponse;

  return result.success;
}
