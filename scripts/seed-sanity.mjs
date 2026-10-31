// Demo content for the landing page and blog. Every document has a fixed id and is written with `createIfNotExists`, so
// running it again (or against a dataset where editors already changed things) never duplicates or overwrites anything.
//
//   SANITY_PROJECT_ID=... SANITY_WRITE_TOKEN=... npm run seed
//
// SANITY_WRITE_TOKEN is an Editor token (sanity.io/manage > API > Tokens); it is only read from the environment here.
const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET ?? 'production';
const token = process.env.SANITY_WRITE_TOKEN;
const base = process.env.SANITY_API_HOST ?? `https://${projectId}.api.sanity.io`;

if (!projectId || !token) {
  console.error('Set SANITY_PROJECT_ID and SANITY_WRITE_TOKEN first.');
  process.exit(1);
}

const ref = (id) => ({ _type: 'reference', _ref: id });
const slug = (current) => ({ _type: 'slug', current });
const block = (key, style, text) => ({
  _type: 'block',
  _key: key,
  style,
  markDefs: [],
  children: [{ _type: 'span', _key: `${key}-s`, text, marks: [] }],
});

const documents = [
  { _id: 'category-tips', _type: 'category', title: 'Tips Usaha', slug: slug('tips-usaha') },
  { _id: 'category-produk', _type: 'category', title: 'Produk', slug: slug('produk') },

  {
    _id: 'testimonial-rina',
    _type: 'testimonial',
    name: 'Rina Wulandari',
    role: 'Pemilik',
    business: 'Kopi Senja',
    quote: 'Sejak pakai Kodeva Kasir, tutup toko tidak lagi lembur menghitung penjualan. Laporan harian langsung rapi.',
  },
  {
    _id: 'testimonial-agus',
    _type: 'testimonial',
    name: 'Agus Prasetyo',
    role: 'Manajer HR',
    business: 'Toko Bangunan Makmur',
    quote: 'Gaji 40 karyawan beres dalam satu jam, lengkap dengan PPh 21 dan BPJS. Dulu butuh dua hari.',
  },
  {
    _id: 'testimonial-siti',
    _type: 'testimonial',
    name: 'Siti Nurhaliza',
    role: 'Owner',
    business: 'Laundry Bersih Jaya',
    quote: 'Fitur poin dan voucher WhatsApp membuat pelanggan lama kembali. Penjualan bulanan naik terasa.',
  },

  {
    _id: 'faq-paket',
    _type: 'faq',
    order: 1,
    question: 'Apa bedanya paket Basic, Pro, dan Business?',
    answer:
      'Basic untuk satu outlet, Pro menambah laporan dan multi pengguna, Business untuk banyak cabang dengan akses penuh.',
  },
  {
    _id: 'faq-kuota',
    _type: 'faq',
    order: 2,
    question: 'Bagaimana cara kerja kuota promo?',
    answer:
      'Setiap produk punya kuota lisensi promo yang dipakai bersama oleh semua paketnya. Jika kuota habis, harga kembali normal.',
  },
  {
    _id: 'faq-tambah',
    _type: 'faq',
    order: 3,
    question: 'Apakah lisensi bisa ditambah nanti?',
    answer: 'Bisa. Anda dapat menambah jumlah user atau outlet kapan saja dari halaman akun.',
  },
  {
    _id: 'faq-demo',
    _type: 'faq',
    order: 4,
    question: 'Apakah ada masa uji coba?',
    answer: 'Ya, tinggalkan kontak Anda di formulir dan tim kami akan menjadwalkan demo gratis.',
  },

  {
    _id: 'landingPage',
    _type: 'landingPage',
    hero: {
      title: 'Promo Akhir Tahun: Hemat hingga 30% untuk Aplikasi Usaha Anda',
      subtitle: 'Aplikasi kasir dan HR & payroll untuk UMKM. Kuota promo terbatas, amankan lisensi Anda sekarang.',
      ctaLabel: 'Lihat katalog',
    },
    featuredProducts: ['kodeva-kasir', 'kodeva-hr-payroll', 'kodeva-absensi'],
    testimonials: [ref('testimonial-rina'), ref('testimonial-agus'), ref('testimonial-siti')].map((item, index) => ({
      ...item,
      _key: `t${index}`,
    })),
    faqs: ['faq-paket', 'faq-kuota', 'faq-tambah', 'faq-demo'].map((id) => ({ ...ref(id), _key: id })),
  },

  {
    _id: 'post-memilih-kasir',
    _type: 'post',
    title: '5 Cara Memilih Aplikasi Kasir yang Tepat untuk Toko Anda',
    slug: slug('cara-memilih-aplikasi-kasir'),
    excerpt: 'Panduan singkat memilih aplikasi kasir: fitur wajib, biaya, dan hal yang sering terlewat.',
    category: ref('category-tips'),
    relatedProducts: ['kodeva-kasir', 'kodeva-inventori'],
    publishedAt: '2026-10-30T08:00:00.000Z',
    body: [
      block(
        'a1',
        'normal',
        'Memilih aplikasi kasir sering terasa membingungkan karena banyak pilihan dengan harga berbeda.',
      ),
      block('a2', 'h2', '1. Pastikan bisa dipakai di HP'),
      block(
        'a3',
        'normal',
        'Sebagian besar pemilik usaha kecil tidak punya komputer kasir, jadi aplikasi harus nyaman di HP dan tablet.',
      ),
      block('a4', 'h2', '2. Cek laporan dan stok'),
      block(
        'a5',
        'normal',
        'Laporan penjualan harian dan peringatan stok menipis menghemat banyak waktu setiap minggu.',
      ),
    ],
  },
  {
    _id: 'post-gaji-pph21',
    _type: 'post',
    title: 'Panduan Menghitung Gaji dan PPh 21 untuk UMKM',
    slug: slug('panduan-gaji-dan-pph-21'),
    excerpt: 'Langkah sederhana menghitung gaji karyawan lengkap dengan PPh 21 dan BPJS.',
    category: ref('category-tips'),
    relatedProducts: ['kodeva-hr-payroll', 'kodeva-absensi'],
    publishedAt: '2026-10-29T08:00:00.000Z',
    body: [
      block('b1', 'normal', 'Menghitung gaji manual rawan salah, terutama saat ada lembur, cuti, dan potongan.'),
      block('b2', 'h2', 'Komponen yang perlu dihitung'),
      block(
        'b3',
        'normal',
        'Gaji pokok, tunjangan, lembur, potongan BPJS, dan PPh 21 sesuai penghasilan tidak kena pajak.',
      ),
    ],
  },
  {
    _id: 'post-promo-akhir-tahun',
    _type: 'post',
    title: 'Apa Saja yang Baru di Promo Akhir Tahun Kodeva',
    slug: slug('promo-akhir-tahun-kodeva'),
    excerpt: 'Diskon hingga 30% dengan kuota lisensi terbatas. Ini produk dan paket yang ikut promo.',
    category: ref('category-produk'),
    relatedProducts: ['kodeva-kasir', 'kodeva-loyalty'],
    publishedAt: '2026-10-28T08:00:00.000Z',
    body: [
      block('c1', 'normal', 'Promo Akhir Tahun berlaku untuk Kodeva Kasir, HR & Payroll, Absensi, dan add-on Loyalty.'),
      block('c2', 'h2', 'Kuota terbatas'),
      block(
        'c3',
        'normal',
        'Setiap produk punya kuota lisensi promo sendiri. Kuota dipakai bersama oleh semua paket produk tersebut.',
      ),
    ],
  },
];

const response = await fetch(`${base}/v2025-02-19/data/mutate/${dataset}`, {
  method: 'POST',
  headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
  body: JSON.stringify({ mutations: documents.map((doc) => ({ createIfNotExists: doc })) }),
});

if (!response.ok) {
  console.error(`Sanity answered ${response.status}: ${await response.text()}`);
  process.exit(1);
}

console.log(
  `Seed done: ${documents.length} documents ensured in ${projectId}/${dataset} (existing ones were left untouched).`,
);
