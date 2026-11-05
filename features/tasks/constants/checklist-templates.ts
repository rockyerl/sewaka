export interface MilestoneTemplateItem {
  title: string;
  description?: string;
  offsetDays: number;
  priority: "LOW" | "MEDIUM" | "HIGH";
}

export interface MilestoneTemplate {
  name: string;
  milestone: string;
  description: string;
  tasks: MilestoneTemplateItem[];
}

export const CHECKLIST_MILESTONE_TEMPLATES: MilestoneTemplate[] = [
  {
    name: "H-365 (1 Tahun Sebelum)",
    milestone: "H-365",
    description: "Penentuan venue, budget awal, dan pembagian keluarga",
    tasks: [
      {
        title: "Tentukan batas anggaran awal & skenario pembagian biaya",
        description: "Diskusikan batas budget dengan pasangan dan kedua keluarga besar",
        offsetDays: -365,
        priority: "HIGH",
      },
      {
        title: "Pilih tanggal pernikahan & konsultasikan hari baik adat",
        description: "Tentukan hari sakral berdasarkan musyawarah keluarga atau penanggalan adat",
        offsetDays: -365,
        priority: "HIGH",
      },
      {
        title: "Pembagian peran & pembentukan panitia keluarga inti",
        description: "Tunjuk ketua panitia keluarga, penanggung jawab seserahan, konsumsi, dan logistik",
        offsetDays: -365,
        priority: "MEDIUM",
      },
      {
        title: "Survei lokasi dan booking venue akad & resepsi",
        description: "Amankan gedung/tempat acara sebelum slot tanggal terisi pasangan lain",
        offsetDays: -365,
        priority: "HIGH",
      },
    ],
  },
  {
    name: "H-180 (6 Bulan Sebelum)",
    milestone: "H-180",
    description: "Katering, dekorasi, busana, fotografer/videografer",
    tasks: [
      {
        title: "Pilih dan booking katering (Food Testing menu utama & gubukan)",
        description: "Cicipi menu, sesuaikan citarasa adat nusantara dan tentukan rasio porsi",
        offsetDays: -180,
        priority: "HIGH",
      },
      {
        title: "Pilih vendor dekorasi pelaminan adat nusantara & tata ruang",
        description: "Sesuaikan tema adat (Jawa/Sunda/Minang/Nasional) dan panggung pelaminan",
        offsetDays: -180,
        priority: "HIGH",
      },
      {
        title: "Pilih MUA (Make Up Artist) & busana pengantin adat",
        description: "Tentukan sanggar rias paes/siger/suntiang dan busana akad serta resepsi",
        offsetDays: -180,
        priority: "HIGH",
      },
      {
        title: "Pilih fotografer & videografer dokumentasi momen sakral",
        description: "Kunci vendor dokumentasi profesional untuk merekam seluruh prosesi",
        offsetDays: -180,
        priority: "MEDIUM",
      },
    ],
  },
  {
    name: "H-90 (3 Bulan Sebelum)",
    milestone: "H-90",
    description: "Fitting baju, cetak undangan, pendaftaran KUA",
    tasks: [
      {
        title: "Fitting pertama busana adat pengantin & seragam keluarga",
        description: "Ukur pakaian akad, resepsi, dan seragam untuk orang tua dan among tamu",
        offsetDays: -90,
        priority: "HIGH",
      },
      {
        title: "Desain & cetak undangan fisik serta siapkan undangan digital",
        description: "Finalisasi daftar tamu dan input ke daftar tamu undangan Sewaka",
        offsetDays: -90,
        priority: "MEDIUM",
      },
      {
        title: "Pendaftaran berkas pernikahan ke KUA / Catatan Sipil",
        description: "Lengkapi dokumen N1, N2, N4, surat rekomendasi, dan tes kesehatan pranikah",
        offsetDays: -90,
        priority: "HIGH",
      },
      {
        title: "Cicil & hias peranti kotak seserahan serta mahar pernikahan",
        description: "Siapkan mahar sakral, perhiasan, dan hias boks hantaran adat",
        offsetDays: -90,
        priority: "MEDIUM",
      },
    ],
  },
  {
    name: "H-30 (1 Bulan Sebelum)",
    milestone: "H-30",
    description: "Technical meeting vendor, finalisasi rundown, konfirmasi RSVP",
    tasks: [
      {
        title: "Technical meeting bersama seluruh vendor & Wedding Organizer",
        description: "Samakan alur acara, timing, kelistrikan, dan layout di lokasi venue",
        offsetDays: -30,
        priority: "HIGH",
      },
      {
        title: "Finalisasi rundown acara & alur prosesi adat sakral",
        description: "Kunci susunan waktu prosesi siraman, akad, sungkeman, hingga resepsi",
        offsetDays: -30,
        priority: "HIGH",
      },
      {
        title: "Sebarkan undangan WA personal & pantau konfirmasi kehadiran RSVP",
        description: "Kirim pesan WA personal dengan tautan Sewaka dan rekap data konfirmasi",
        offsetDays: -30,
        priority: "HIGH",
      },
      {
        title: "Fitting final busana pengantin & gladi busana",
        description: "Pastikan kenyamanan pakaian, kelengkapan aksesori, dan sepatu pernikahan",
        offsetDays: -30,
        priority: "MEDIUM",
      },
    ],
  },
  {
    name: "H-7 & Hari H (1 Minggu s.d. Hari H)",
    milestone: "H-7 & Hari H",
    description: "Gladi resik, serah terima peranti mahar/seserahan",
    tasks: [
      {
        title: "Gladi resik susunan prosesi adat & alur kirab pengantin",
        description: "Latihan alur masuk pengantin, penyerahan seserahan, dan proses sungkeman",
        offsetDays: -7,
        priority: "HIGH",
      },
      {
        title: "Serah terima peranti mahar, cincin kawin, & kotak seserahan",
        description: "Titipkan mahar dan cincin kepada penanggung jawab saksi/keluarga inti yang aman",
        offsetDays: -3,
        priority: "HIGH",
      },
      {
        title: "Konfirmasi kehadiran saksi nikah, penghulu KUA & tim WO",
        description: "Pastikan saksi dari kedua pihak dan penghulu hadir tepat waktu pada akad",
        offsetDays: -2,
        priority: "HIGH",
      },
      {
        title: "Briefing akhir panitia keluarga & perlengkapan sakral hari H",
        description: "Pastikan konsumsi keluarga, sound system, sound check, dan meja check-in tamu siap",
        offsetDays: 0,
        priority: "HIGH",
      },
    ],
  },
];
