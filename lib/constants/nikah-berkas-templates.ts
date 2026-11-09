export type NikahType = "SIPIL" | "AGAMA" | "KUA";

export type NikahDocument = {
  documentName: string;
  documentDescription: string;
  isRequired: boolean;
  deadlineDays?: number; // hari sebelum nikah
};

export const NIKAH_BERKAS_TEMPLATES: Record<NikahType, NikahDocument[]> = {
  SIPIL: [
    {
      documentName: "Surat Pengantar Nikah (SNP)",
      documentDescription: "Diperoleh dari kelurahan/domisili, berlaku 30 hari",
      isRequired: true,
      deadlineDays: 14,
    },
    {
      documentName: "KTP Calon Mempelai",
      documentDescription: "KTP asli dan fotokopi kedua calon mempelai",
      isRequired: true,
    },
    {
      documentName: "KK (Kartu Keluarga)",
      documentDescription: "Fotokopi KK kedua calon mempelai",
      isRequired: true,
    },
    {
      documentName: "Akta Kelahiran",
      documentDescription: "Fotokopi akta kelahiran kedua calon mempelai",
      isRequired: true,
    },
    {
      documentName: "Surat Keterangan Belum Menikah",
      documentDescription: "Untuk yang belum pernah menikah, dari kelurahan",
      isRequired: false,
      deadlineDays: 14,
    },
    {
      documentName: "Surat Cerai / Surat Kematian",
      documentDescription: "Jika pernah menikah, bawa surat cerai atau surat kematian pasangan",
      isRequired: false,
    },
    {
      documentName: "Pas Foto 4x6",
      documentDescription: "8 lembar pas foto 4x6 cm background merah marun",
      isRequired: true,
    },
    {
      documentName: "Surat Izin Orang Tua",
      documentDescription: "Jika salah satu calon mempelai belum berusia 21 tahun",
      isRequired: false,
    },
    {
      documentName: "Surat Dispensasi Nikah",
      documentDescription: "Jika belum berusia 19 tahun, perlu dispensasi dari pengadilan agama",
      isRequired: false,
      deadlineDays: 30,
    },
    {
      documentName: "Surat Keterangan Kesehatan",
      documentDescription: "Hasil pemeriksaan kesehatan dari puskesmas/rumah sakit",
      isRequired: false,
    },
  ],
  AGAMA: [
    {
      documentName: "KTP Calon Mempelai",
      documentDescription: "KTP asli dan fotokopi kedua calon mempelai",
      isRequired: true,
    },
    {
      documentName: "KK (Kartu Keluarga)",
      documentDescription: "Fotokopi KK kedua calon mempelai",
      isRequired: true,
    },
    {
      documentName: "Surat Keterangan Berhalangan Ekonomi",
      documentDescription: "Dari kelurahan, untuk pendaftaran nikah di KUA",
      isRequired: true,
      deadlineDays: 14,
    },
    {
      documentName: "Surat Keterangan Siap Nikah",
      documentDescription: "Dari KUA setelah selesai bimbingan nikah",
      isRequired: true,
      deadlineDays: 7,
    },
    {
      documentName: "Bukti Telah Mengikuti Bimbingan Nikah",
      documentDescription: "Sertifikat kelulusan bimbingan nikah dari KUA",
      isRequired: true,
      deadlineDays: 7,
    },
    {
      documentName: "Pas Foto 4x6",
      documentDescription: "4 lembar pas foto 4x6 cm",
      isRequired: true,
    },
    {
      documentName: "Surat Izin Orang Tua",
      documentDescription: "Jika belum berusia 21 tahun",
      isRequired: false,
    },
    {
      documentName: "Surat Izin Komandan (TNI/Polri)",
      documentDescription: "Jika salah satu calon mempelai berstatus TNI/Polri",
      isRequired: false,
      deadlineDays: 30,
    },
    {
      documentName: "Surat Izin Dubes (WNA)",
      documentDescription: "Jika salah satu calon mempelai berstatus WNA",
      isRequired: false,
      deadlineDays: 60,
    },
    {
      documentName: "Surat Keterangan Tidak Mampu",
      documentDescription: "Untuk mendapatkan keringanan biaya administrasi",
      isRequired: false,
    },
  ],
  KUA: [
    {
      documentName: "KTP Calon Mempelai",
      documentDescription: "KTP asli dan fotokopi kedua calon mempelai",
      isRequired: true,
    },
    {
      documentName: "KK (Kartu Keluarga)",
      documentDescription: "Fotokopi KK kedua calon mempelai",
      isRequired: true,
    },
    {
      documentName: "Surat Pengantar Nikah (SNP)",
      documentDescription: "Dari kelurahan domisili, berlaku 30 hari",
      isRequired: true,
      deadlineDays: 14,
    },
    {
      documentName: "Surat Keterangan Berhalangan Ekonomi",
      documentDescription: "Dari kelurahan untuk pendaftaran di KUA",
      isRequired: true,
      deadlineDays: 14,
    },
    {
      documentName: "Bukti Telah Mengikuti Bimbingan Nikah",
      documentDescription: "Sertifikat kelulusan bimbingan nikah dari KUA",
      isRequired: true,
      deadlineDays: 7,
    },
    {
      documentName: "Pas Foto 4x6",
      documentDescription: "8 lembar pas foto 4x6 cm background merah marun",
      isRequired: true,
    },
    {
      documentName: "Akta Kelahiran",
      documentDescription: "Fotokopi akta kelahiran kedua calon mempelai",
      isRequired: true,
    },
    {
      documentName: "Surat Cerai / Surat Kematian",
      documentDescription: "Jika pernah menikah",
      isRequired: false,
    },
    {
      documentName: "Surat Izin Orang Tua",
      documentDescription: "Jika belum berusia 21 tahun",
      isRequired: false,
    },
    {
      documentName: "Surat Izin Komandan (TNI/Polri)",
      documentDescription: "Jika berstatus TNI/Polri",
      isRequired: false,
      deadlineDays: 30,
    },
    {
      documentName: "Surat Keterangan Kesehatan",
      documentDescription: "Hasil pemeriksaan kesehatan dari puskesmas",
      isRequired: false,
    },
    {
      documentName: "Surat Dispensasi Nikah",
      documentDescription: "Jika belum berusia 19 tahun",
      isRequired: false,
      deadlineDays: 30,
    },
  ],
};
