// Local stand-in for the Sanity HTTP API, for tests only. It answers the four read queries the site makes with
// CMS-shaped fixtures and records the lead documents the leads Function writes.
//
//   npm run mock:sanity              (listens on 4010)
//   SANITY_PROJECT_ID=mock SANITY_API_HOST=http://localhost:4010 npm run build
//   curl localhost:4010/_leads       (what the Function wrote)
import { createServer } from 'node:http';

const PORT = Number(process.env.MOCK_SANITY_PORT ?? 4010);

const block = (key, style, text) => ({
  _type: 'block',
  _key: key,
  style,
  markDefs: [],
  children: [{ _type: 'span', _key: `${key}-s`, text, marks: [] }],
});

const CATEGORY = { title: 'Tips Usaha', slug: 'tips-usaha' };

const posts = Array.from({ length: 7 }, (_, index) => {
  const n = index + 1;
  const day = String(30 - index).padStart(2, '0');

  return {
    _id: `post-${n}`,
    title: n === 1 ? '5 Cara Memilih Aplikasi Kasir yang Tepat untuk Toko Anda' : `Artikel contoh nomor ${n}`,
    slug: n === 1 ? 'cara-memilih-aplikasi-kasir' : `artikel-contoh-${n}`,
    excerpt: `Ringkasan artikel ${n} untuk menguji daftar, paginasi, dan halaman detail.`,
    publishedAt: `2026-10-${day}T08:00:00.000Z`,
    _createdAt: `2026-10-${day}T07:00:00.000Z`,
    _updatedAt: `2026-10-${day}T09:00:00.000Z`,
    cover:
      n === 1
        ? {
            url: 'https://cdn.sanity.io/images/mock/production/cover-1200x630.jpg',
            alt: 'Kasir toko',
            width: 1200,
            height: 630,
          }
        : null,
    category: CATEGORY,
    relatedProducts: n === 1 ? ['kodeva-kasir', 'kodeva-inventori'] : ['kodeva-hr-payroll'],
    body: [
      block(`b${n}-1`, 'normal', `Isi artikel ${n}. Memilih aplikasi kasir sering terasa membingungkan.`),
      block(`b${n}-2`, 'h2', 'Pastikan bisa dipakai di HP'),
      block(`b${n}-3`, 'normal', 'Sebagian besar pemilik usaha kecil tidak punya komputer kasir.'),
    ],
  };
});

const landing = {
  hero: {
    title: 'Judul dari CMS: Promo Akhir Tahun',
    subtitle: 'Subjudul yang diubah tim marketing tanpa developer.',
    ctaLabel: 'Lihat katalog',
    image: {
      url: 'https://cdn.sanity.io/images/mock/production/hero-1600x1200.jpg',
      alt: 'Tim kasir',
      width: 1600,
      height: 1200,
    },
  },
  featuredProducts: ['kodeva-kasir', 'kodeva-hr-payroll', 'kodeva-absensi'],
  testimonials: [
    {
      _id: 't1',
      name: 'Rina Wulandari',
      role: 'Pemilik',
      business: 'Kopi Senja',
      quote: 'Laporan harian langsung rapi.',
    },
    {
      _id: 't2',
      name: 'Agus Prasetyo',
      role: 'Manajer HR',
      business: 'Toko Makmur',
      quote: 'Gaji beres dalam satu jam.',
    },
  ],
  faqs: [
    {
      _id: 'f1',
      question: 'Bagaimana cara kerja kuota promo?',
      answer: 'Kuota dipakai bersama oleh semua paket produk.',
      order: 1,
    },
    { _id: 'f2', question: 'Apakah ada uji coba?', answer: 'Ya, tinggalkan kontak untuk demo gratis.', order: 2 },
  ],
};

// the image URLs are fake and cannot load offline; MOCK_NO_IMAGES=1 drops them for performance measurements
if (process.env.MOCK_NO_IMAGES) {
  landing.hero.image = null;
  posts.forEach((post) => {
    post.cover = null;
  });
}

const leads = [];

function answer(query, params) {
  if (query.includes('_id == "landingPage"')) {
    return landing;
  }

  if (query.includes('count(')) {
    const from = Number(params.from ?? 0);
    const to = Number(params.to ?? 6);

    return {
      total: posts.length,
      // the list query selects the summary fields only
      items: posts.slice(from, to).map((post) => {
        const item = { ...post };

        delete item.body;
        delete item.relatedProducts;

        return item;
      }),
    };
  }

  if (query.includes('slug.current == $slug')) {
    return posts.find((post) => post.slug === params.slug) ?? null;
  }

  return posts.map((post) => post.slug);
}

createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const send = (status, body) => {
    res.writeHead(status, { 'content-type': 'application/json' });
    res.end(JSON.stringify(body));
  };

  if (req.method === 'GET' && url.pathname.includes('/data/query/')) {
    const params = {};

    url.searchParams.forEach((value, key) => {
      if (key.startsWith('$')) {
        params[key.slice(1)] = JSON.parse(value);
      }
    });

    return send(200, {
      ms: 1,
      query: url.searchParams.get('query'),
      result: answer(url.searchParams.get('query') ?? '', params),
    });
  }

  if (req.method === 'POST' && url.pathname.includes('/data/mutate/')) {
    let raw = '';

    for await (const chunk of req) {
      raw += chunk;
    }

    if (!req.headers.authorization?.startsWith('Bearer ')) {
      return send(401, { error: 'missing token' });
    }

    const { mutations } = JSON.parse(raw);

    // `create` (lead Function) and `createIfNotExists` (seed script): both just get recorded
    mutations.forEach((mutation) => leads.push(mutation.create ?? mutation.createIfNotExists));

    return send(200, { transactionId: `tx-${leads.length}`, results: mutations.map(() => ({ operation: 'create' })) });
  }

  if (url.pathname === '/_leads') {
    return send(200, leads);
  }

  return send(404, { error: `mock has no route for ${req.method} ${url.pathname}` });
}).listen(PORT, () => console.log(`mock sanity listening on http://localhost:${PORT}`));
