export const UTM_KEYS = ['source', 'medium', 'campaign', 'content', 'term'] as const;

export type UtmKey = (typeof UTM_KEYS)[number];
export type IUtm = Partial<Record<UtmKey, string>>;

const STORAGE_KEY = 'kodeva:utm';
const MAX_VALUE_LENGTH = 100;

export function parseUtm(search: string): IUtm {
  const params = new URLSearchParams(search);
  const utm: IUtm = {};

  UTM_KEYS.forEach((key) => {
    const value = params.get(`utm_${key}`)?.trim();

    if (value) {
      utm[key] = value.slice(0, MAX_VALUE_LENGTH);
    }
  });

  return utm;
}

function readStorage(): IUtm {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    return raw ? (JSON.parse(raw) as IUtm) : {};
  } catch {
    return {};
  }
}

// Last-touch: a landing with UTM parameters replaces what was stored, a landing without keeps it. That way a visitor
// who opens the campaign link from Instagram, browses a few pages and only then fills the form is still attributed.
export function captureUtm(search: string = window.location.search): IUtm {
  const fromUrl = parseUtm(search);

  if (Object.keys(fromUrl).length === 0) {
    return readStorage();
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fromUrl));
  } catch {
    // storage can be blocked (private mode, in-app browsers); attribution then only lasts for this page
  }

  return fromUrl;
}

export function getUtm(): IUtm {
  return readStorage();
}
