import type { CulturalTradition } from "./rundown-templates";

export interface ChecklistTemplateItem {
  title: string;
  description: string;
  category: string;
  milestone: "H-365" | "H-180" | "H-90" | "H-30" | "H-7" | "H-1" | "HARI_H";
  offsetDays: number;
  priority: "LOW" | "MEDIUM" | "HIGH";
}

export const CHECKLIST_TEMPLATES: Record<CulturalTradition, ChecklistTemplateItem[]> = {
  JAWA: [
    {
      title: "Booking Pemaes & Perias Paes Ageng",
      description: "Pemaes bersertifikat adat kraton yang menguasai pakem cengkorongan paes dan busana dodot.",
      category: "Adat & Busana",
      milestone: "H-365",
      offsetDays: -365,
      priority: "HIGH",
    },
    {
      title: "Booking Pambiwara / Pranatacara Adat",
      description: "MC adat Jawa yang fasih bahasa Kawi/Krama Inggil untuk memandu sakralnya upacara panggih.",
      category: "Vendor & MC",
      milestone: "H-180",
      offsetDays: -180,
      priority: "HIGH",
    },
    {
      title: "Fitting Beskap Landhung & Jarik Sidomukti",
      description: "Fitting busana kedua mempelai, orang tua, dan beskap among tamu seragam.",
      category: "Adat & Busana",
      milestone: "H-90",
      offsetDays: -90,
      priority: "MEDIUM",
    },
    {
      title: "Belanja Peranti Siraman & Kembang Setaman",
      description: "Cengkir gading kelapa kuning digambar Kamajaya-Ratih, siwur batok kelapa, 7 sumber mata air suci.",
      category: "Peranti Ritual",
      milestone: "H-30",
      offsetDays: -30,
      priority: "HIGH",
    },
    {
      title: "Pemasangan Bleketepe & Tuwuhan",
      description: "Anyaman daun kelapa dipasang di atap rumah, pisang raja sesisir berbuah matang penolak bala.",
      category: "Peranti Ritual",
      milestone: "H-7",
      offsetDays: -7,
      priority: "HIGH",
    },
    {
      title: "Prosesi Siraman & Sade Dawet",
      description: "Upacara pembersihan diri lahir batin, dilanjutkan jualan dawet dengan kreweng koin tanah liat.",
      category: "Prosesi Adat",
      milestone: "H-1",
      offsetDays: -1,
      priority: "HIGH",
    },
    {
      title: "Malam Midodareni & Nyantrik",
      description: "Malam bidadari turun mempercantik calon pengantin putri; calon mempelai kakang datang nyantrik.",
      category: "Prosesi Adat",
      milestone: "H-1",
      offsetDays: -1,
      priority: "MEDIUM",
    },
  ],
  SUNDA: [
    {
      title: "Booking Sanggar Rias Sunda Siger Asli",
      description: "MUA spesialis mahkota Siger yang proporsional sesuai bentuk wajah pengantin.",
      category: "Adat & Busana",
      milestone: "H-365",
      offsetDays: -365,
      priority: "HIGH",
    },
    {
      title: "Booking Tim Lengser & Nayaga Musik Degung",
      description: "Kelompok kesenian tradisional Sunda pembawa tarian mapag panganten dan alunan kecapi suling.",
      category: "Kesenian & Musik",
      milestone: "H-180",
      offsetDays: -180,
      priority: "HIGH",
    },
    {
      title: "Persiapan Peranti Ritual Ngeuyeuk Seureuh",
      description: "Kain mori, 7 lembar sirih, mayang jambe, benang lawe kanteh, parawanten.",
      category: "Peranti Ritual",
      milestone: "H-30",
      offsetDays: -30,
      priority: "HIGH",
    },
    {
      title: "Pesan Bakakak Hayam untuk Hari H",
      description: "Satu ekor ayam kampung utuh bumbu bakar tradisional untuk ritual pabetot bakakak.",
      category: "Konsumsi Adat",
      milestone: "H-7",
      offsetDays: -7,
      priority: "MEDIUM",
    },
    {
      title: "Prosesi Ngaras & Siraman Sunda",
      description: "Mencuci kaki kedua orang tua dan siraman 7 mata air suci di kediaman mempelai.",
      category: "Prosesi Adat",
      milestone: "H-1",
      offsetDays: -1,
      priority: "HIGH",
    },
  ],
  MINANG: [
    {
      title: "Musyawarah Batimbang Tando / Marosok",
      description: "Pertemuan keluarga besar mengikat janji dengan tanda keris atau kain pusaka.",
      category: "Adat & Keluarga",
      milestone: "H-365",
      offsetDays: -365,
      priority: "HIGH",
    },
    {
      title: "Booking Sanggar Minang & Suntiang Emas",
      description: "Pemesanan busana beludru marun dan pemasangan suntiang yang proporsional.",
      category: "Adat & Busana",
      milestone: "H-180",
      offsetDays: -180,
      priority: "HIGH",
    },
    {
      title: "Persiapan Pelaminan Minang Khas Rumah Gadang",
      description: "Dekorasi pelaminan dengan ukiran ranji motif Minangkabau dan kelambu tabir emas.",
      category: "Dekorasi Adat",
      milestone: "H-90",
      offsetDays: -90,
      priority: "MEDIUM",
    },
    {
      title: "Penyusunan Rombongan Manjapuik Marapulai",
      description: "Daftar mamak dan keluarga yang akan menjemput calon pengantin pria ke rumahnya.",
      category: "Keluarga & Adat",
      milestone: "H-30",
      offsetDays: -30,
      priority: "HIGH",
    },
    {
      title: "Malam Bainai Anak Daro",
      description: "Malam memerahkan kuku calon mempelai wanita dengan daun inai oleh para sesepuh wanita.",
      category: "Prosesi Adat",
      milestone: "H-1",
      offsetDays: -1,
      priority: "HIGH",
    },
  ],
  NASIONAL: [
    {
      title: "Penetapan Tanggal & Pemilihan Venue",
      description: "Memilih dan memesan ballroom atau gedung pernikahan utama.",
      category: "Venue & Tanggal",
      milestone: "H-365",
      offsetDays: -365,
      priority: "HIGH",
    },
    {
      title: "Pemesanan Catering & Food Tasting",
      description: "Menentukan menu utama dan stall selera Nusantara & internasional.",
      category: "Catering",
      milestone: "H-180",
      offsetDays: -180,
      priority: "HIGH",
    },
    {
      title: "Penyebaran Undangan Digital & RSVP Sewaka",
      description: "Kirimkan link e-invitation kepada seluruh daftar tamu undangan.",
      category: "Undangan & Tamu",
      milestone: "H-30",
      offsetDays: -30,
      priority: "HIGH",
    },
    {
      title: "Technical Meeting Vendor & Gladi Bersih",
      description: "Rapat koordinasi final bersama seluruh vendor dan Wedding Organizer.",
      category: "Koordinasi",
      milestone: "H-7",
      offsetDays: -7,
      priority: "HIGH",
    },
    {
      title: "Pengecekan Barang Bawaan & Mas Kawin",
      description: "Pastikan cincin kawin, mas kawin, dan busana sudah tertata di venue.",
      category: "Perlengkapan",
      milestone: "H-1",
      offsetDays: -1,
      priority: "HIGH",
    },
  ],

  // --- Checklist tambahan per adat (bukan kewajiban universal) ---
  BETAWI: [
    {
      "title": "Sepakati ngelamar dan bawa tande putus",
      "description": "Diskusikan dan catat versi adat keluarga yang dipilih.",
      "category": "Keluarga & Adat",
      "milestone": "H-365",
      "offsetDays": -365,
      "priority": "HIGH"
    },
    {
      "title": "Pesan kelompok Palang Pintu dan rebana",
      "description": "Pastikan kesediaan, biaya, dan ruang lingkup pemandu adat.",
      "category": "Vendor Adat",
      "milestone": "H-180",
      "offsetDays": -180,
      "priority": "HIGH"
    },
    {
      "title": "Fitting kebaya / busana pengantin Betawi",
      "description": "Cocokkan ukuran, aksesori, dan kebutuhan pergantian busana.",
      "category": "Busana Adat",
      "milestone": "H-90",
      "offsetDays": -90,
      "priority": "MEDIUM"
    },
    {
      "title": "Pesan roti buaya dan hantaran",
      "description": "Daftar inventaris sesuai arahan pemangku atau keluarga.",
      "category": "Peranti Ritual",
      "milestone": "H-30",
      "offsetDays": -30,
      "priority": "HIGH"
    },
    {
      "title": "Gladi pantun dan koreografi silat aman",
      "description": "Verifikasi urutan, personel, jam mulai, dan antisipasi.",
      "category": "Koordinasi",
      "milestone": "H-7",
      "offsetDays": -7,
      "priority": "HIGH"
    },
    {
      "title": "Periksa kembang kelape, roti buaya dan seserahan",
      "description": "Finalisasi peralatan dan koordinasi keluarga.",
      "category": "Persiapan Adat",
      "milestone": "H-1",
      "offsetDays": -1,
      "priority": "HIGH"
    },
    {
      "title": "Briefing jalur arak-arakan & jawara",
      "description": "Tunjuk PIC dan konfirmasi kesiapan acara.",
      "category": "Hari H",
      "milestone": "HARI_H",
      "offsetDays": 0,
      "priority": "HIGH"
    }
  ],
  BATAK_TOBA: [
    {
      "title": "Musyawarah marhusip dan marhata sinamot",
      "description": "Diskusikan dan catat versi adat keluarga yang dipilih.",
      "category": "Keluarga & Adat",
      "milestone": "H-365",
      "offsetDays": -365,
      "priority": "HIGH"
    },
    {
      "title": "Pesan raja parhata serta musik gondang",
      "description": "Pastikan kesediaan, biaya, dan ruang lingkup pemandu adat.",
      "category": "Vendor Adat",
      "milestone": "H-180",
      "offsetDays": -180,
      "priority": "HIGH"
    },
    {
      "title": "Koordinasi busana dan daftar pemberi ulos",
      "description": "Cocokkan ukuran, aksesori, dan kebutuhan pergantian busana.",
      "category": "Busana Adat",
      "milestone": "H-90",
      "offsetDays": -90,
      "priority": "MEDIUM"
    },
    {
      "title": "Finalisasi martonggo raja dan pembagian jambar",
      "description": "Daftar inventaris sesuai arahan pemangku atau keluarga.",
      "category": "Peranti Ritual",
      "milestone": "H-30",
      "offsetDays": -30,
      "priority": "HIGH"
    },
    {
      "title": "Pastikan urutan pemberi ulos dan kebutuhan jamuan",
      "description": "Verifikasi urutan, personel, jam mulai, dan antisipasi.",
      "category": "Koordinasi",
      "milestone": "H-7",
      "offsetDays": -7,
      "priority": "HIGH"
    },
    {
      "title": "Konfirmasi semua perwakilan marga",
      "description": "Finalisasi peralatan dan koordinasi keluarga.",
      "category": "Persiapan Adat",
      "milestone": "H-1",
      "offsetDays": -1,
      "priority": "HIGH"
    },
    {
      "title": "Briefing mangulosi dan tortor",
      "description": "Tunjuk PIC dan konfirmasi kesiapan acara.",
      "category": "Hari H",
      "milestone": "HARI_H",
      "offsetDays": 0,
      "priority": "HIGH"
    }
  ],
  MANDAILING: [
    {
      "title": "Sepakati patobang hata dan manulak sere",
      "description": "Diskusikan dan catat versi adat keluarga yang dipilih.",
      "category": "Keluarga & Adat",
      "milestone": "H-365",
      "offsetDays": -365,
      "priority": "HIGH"
    },
    {
      "title": "Pesan raja adat, pargonsi, serta pemandu horja",
      "description": "Pastikan kesediaan, biaya, dan ruang lingkup pemandu adat.",
      "category": "Vendor Adat",
      "milestone": "H-180",
      "offsetDays": -180,
      "priority": "HIGH"
    },
    {
      "title": "Fitting bulang, ampu dan busana keluarga",
      "description": "Cocokkan ukuran, aksesori, dan kebutuhan pergantian busana.",
      "category": "Busana Adat",
      "milestone": "H-90",
      "offsetDays": -90,
      "priority": "MEDIUM"
    },
    {
      "title": "Atur perlengkapan mangupa dan markobar",
      "description": "Daftar inventaris sesuai arahan pemangku atau keluarga.",
      "category": "Peranti Ritual",
      "milestone": "H-30",
      "offsetDays": -30,
      "priority": "HIGH"
    },
    {
      "title": "Tetapkan pembicara Dalihan Na Tolu",
      "description": "Verifikasi urutan, personel, jam mulai, dan antisipasi.",
      "category": "Koordinasi",
      "milestone": "H-7",
      "offsetDays": -7,
      "priority": "HIGH"
    },
    {
      "title": "Cek rombongan mangalo-alo dan instrumen",
      "description": "Finalisasi peralatan dan koordinasi keluarga.",
      "category": "Persiapan Adat",
      "milestone": "H-1",
      "offsetDays": -1,
      "priority": "HIGH"
    },
    {
      "title": "Briefing mangupa serta alur horja",
      "description": "Tunjuk PIC dan konfirmasi kesiapan acara.",
      "category": "Hari H",
      "milestone": "HARI_H",
      "offsetDays": 0,
      "priority": "HIGH"
    }
  ],
  ACEH: [
    {
      "title": "Musyawarah tahap adat Aceh dan lamaran",
      "description": "Diskusikan dan catat versi adat keluarga yang dipilih.",
      "category": "Keluarga & Adat",
      "milestone": "H-365",
      "offsetDays": -365,
      "priority": "HIGH"
    },
    {
      "title": "Pesan perias serta pemandu peusijuek",
      "description": "Pastikan kesediaan, biaya, dan ruang lingkup pemandu adat.",
      "category": "Vendor Adat",
      "milestone": "H-180",
      "offsetDays": -180,
      "priority": "HIGH"
    },
    {
      "title": "Fitting busana Dara Baro dan Linto Baro",
      "description": "Cocokkan ukuran, aksesori, dan kebutuhan pergantian busana.",
      "category": "Busana Adat",
      "milestone": "H-90",
      "offsetDays": -90,
      "priority": "MEDIUM"
    },
    {
      "title": "Belanja bahan peusijuek sesuai tetua",
      "description": "Daftar inventaris sesuai arahan pemangku atau keluarga.",
      "category": "Peranti Ritual",
      "milestone": "H-30",
      "offsetDays": -30,
      "priority": "HIGH"
    },
    {
      "title": "Koordinasi rombongan intat linto",
      "description": "Verifikasi urutan, personel, jam mulai, dan antisipasi.",
      "category": "Koordinasi",
      "milestone": "H-7",
      "offsetDays": -7,
      "priority": "HIGH"
    },
    {
      "title": "Siapkan ranup / boh gaca bila dipilih",
      "description": "Finalisasi peralatan dan koordinasi keluarga.",
      "category": "Persiapan Adat",
      "milestone": "H-1",
      "offsetDays": -1,
      "priority": "HIGH"
    },
    {
      "title": "Briefing peusijuek, doa, dan penyambutan",
      "description": "Tunjuk PIC dan konfirmasi kesiapan acara.",
      "category": "Hari H",
      "milestone": "HARI_H",
      "offsetDays": 0,
      "priority": "HIGH"
    }
  ],
  MELAYU_RIAU: [
    {
      "title": "Musyawarah merisik dan meminang",
      "description": "Diskusikan dan catat versi adat keluarga yang dipilih.",
      "category": "Keluarga & Adat",
      "milestone": "H-365",
      "offsetDays": -365,
      "priority": "HIGH"
    },
    {
      "title": "Pesan penutur pantun dan pemandu tepung tawar",
      "description": "Pastikan kesediaan, biaya, dan ruang lingkup pemandu adat.",
      "category": "Vendor Adat",
      "milestone": "H-180",
      "offsetDays": -180,
      "priority": "HIGH"
    },
    {
      "title": "Fitting busana songket Melayu",
      "description": "Cocokkan ukuran, aksesori, dan kebutuhan pergantian busana.",
      "category": "Busana Adat",
      "milestone": "H-90",
      "offsetDays": -90,
      "priority": "MEDIUM"
    },
    {
      "title": "Siapkan tepak sirih dan bahan tepung tawar",
      "description": "Daftar inventaris sesuai arahan pemangku atau keluarga.",
      "category": "Peranti Ritual",
      "milestone": "H-30",
      "offsetDays": -30,
      "priority": "HIGH"
    },
    {
      "title": "Konfirmasi jadwal malam berinai",
      "description": "Verifikasi urutan, personel, jam mulai, dan antisipasi.",
      "category": "Koordinasi",
      "milestone": "H-7",
      "offsetDays": -7,
      "priority": "HIGH"
    },
    {
      "title": "Periksa busana, inai, dan peranti adat",
      "description": "Finalisasi peralatan dan koordinasi keluarga.",
      "category": "Persiapan Adat",
      "milestone": "H-1",
      "offsetDays": -1,
      "priority": "HIGH"
    },
    {
      "title": "Briefing pantun, akad, dan bersanding",
      "description": "Tunjuk PIC dan konfirmasi kesiapan acara.",
      "category": "Hari H",
      "milestone": "HARI_H",
      "offsetDays": 0,
      "priority": "HIGH"
    }
  ],
  PALEMBANG: [
    {
      "title": "Musyawarah berasan dan mutus kato",
      "description": "Diskusikan dan catat versi adat keluarga yang dipilih.",
      "category": "Keluarga & Adat",
      "milestone": "H-365",
      "offsetDays": -365,
      "priority": "HIGH"
    },
    {
      "title": "Pesan perias Aesan dan pemandu munggah",
      "description": "Pastikan kesediaan, biaya, dan ruang lingkup pemandu adat.",
      "category": "Vendor Adat",
      "milestone": "H-180",
      "offsetDays": -180,
      "priority": "HIGH"
    },
    {
      "title": "Fitting Aesan Gede / Paksangko",
      "description": "Cocokkan ukuran, aksesori, dan kebutuhan pergantian busana.",
      "category": "Busana Adat",
      "milestone": "H-90",
      "offsetDays": -90,
      "priority": "MEDIUM"
    },
    {
      "title": "Siapkan tenong dan nganterke belanjo",
      "description": "Daftar inventaris sesuai arahan pemangku atau keluarga.",
      "category": "Peranti Ritual",
      "milestone": "H-30",
      "offsetDays": -30,
      "priority": "HIGH"
    },
    {
      "title": "Gladi arak pengantin dan alur munggah",
      "description": "Verifikasi urutan, personel, jam mulai, dan antisipasi.",
      "category": "Koordinasi",
      "milestone": "H-7",
      "offsetDays": -7,
      "priority": "HIGH"
    },
    {
      "title": "Periksa songket, hantaran, dan aksesori",
      "description": "Finalisasi peralatan dan koordinasi keluarga.",
      "category": "Persiapan Adat",
      "milestone": "H-1",
      "offsetDays": -1,
      "priority": "HIGH"
    },
    {
      "title": "Briefing keluarga untuk munggah",
      "description": "Tunjuk PIC dan konfirmasi kesiapan acara.",
      "category": "Hari H",
      "milestone": "HARI_H",
      "offsetDays": 0,
      "priority": "HIGH"
    }
  ],
  LAMPUNG_PEPADUN: [
    {
      "title": "Musyawarah penyimbang: begawi atau sederhana",
      "description": "Diskusikan dan catat versi adat keluarga yang dipilih.",
      "category": "Keluarga & Adat",
      "milestone": "H-365",
      "offsetDays": -365,
      "priority": "HIGH"
    },
    {
      "title": "Pesan pemandu adat dan penata cangget",
      "description": "Pastikan kesediaan, biaya, dan ruang lingkup pemandu adat.",
      "category": "Vendor Adat",
      "milestone": "H-180",
      "offsetDays": -180,
      "priority": "HIGH"
    },
    {
      "title": "Fitting siger dan kain tapis",
      "description": "Cocokkan ukuran, aksesori, dan kebutuhan pergantian busana.",
      "category": "Busana Adat",
      "milestone": "H-90",
      "offsetDays": -90,
      "priority": "MEDIUM"
    },
    {
      "title": "Inventaris sarana begawi menurut keputusan adat",
      "description": "Daftar inventaris sesuai arahan pemangku atau keluarga.",
      "category": "Peranti Ritual",
      "milestone": "H-30",
      "offsetDays": -30,
      "priority": "HIGH"
    },
    {
      "title": "Cek kelayakan jadwal bila begawi multi-hari",
      "description": "Verifikasi urutan, personel, jam mulai, dan antisipasi.",
      "category": "Koordinasi",
      "milestone": "H-7",
      "offsetDays": -7,
      "priority": "HIGH"
    },
    {
      "title": "Konfirmasi gelar dan undangan tetua jika relevan",
      "description": "Finalisasi peralatan dan koordinasi keluarga.",
      "category": "Persiapan Adat",
      "milestone": "H-1",
      "offsetDays": -1,
      "priority": "HIGH"
    },
    {
      "title": "Briefing cangget dan penghormatan adat",
      "description": "Tunjuk PIC dan konfirmasi kesiapan acara.",
      "category": "Hari H",
      "milestone": "HARI_H",
      "offsetDays": 0,
      "priority": "HIGH"
    }
  ],
  BUGIS: [
    {
      "title": "Musyawarah madduta dan mappettu ada",
      "description": "Diskusikan dan catat versi adat keluarga yang dipilih.",
      "category": "Keluarga & Adat",
      "milestone": "H-365",
      "offsetDays": -365,
      "priority": "HIGH"
    },
    {
      "title": "Pesan pemandu mappacci dan kelompok pengantar",
      "description": "Pastikan kesediaan, biaya, dan ruang lingkup pemandu adat.",
      "category": "Vendor Adat",
      "milestone": "H-180",
      "offsetDays": -180,
      "priority": "HIGH"
    },
    {
      "title": "Fitting baju bodo dan lipa sabbe",
      "description": "Cocokkan ukuran, aksesori, dan kebutuhan pergantian busana.",
      "category": "Busana Adat",
      "milestone": "H-90",
      "offsetDays": -90,
      "priority": "MEDIUM"
    },
    {
      "title": "Siapkan daun pacci dan bosara",
      "description": "Daftar inventaris sesuai arahan pemangku atau keluarga.",
      "category": "Peranti Ritual",
      "milestone": "H-30",
      "offsetDays": -30,
      "priority": "HIGH"
    },
    {
      "title": "Atur transport mappenre botting",
      "description": "Verifikasi urutan, personel, jam mulai, dan antisipasi.",
      "category": "Koordinasi",
      "milestone": "H-7",
      "offsetDays": -7,
      "priority": "HIGH"
    },
    {
      "title": "Pelaksanaan malam mappacci bila dipilih",
      "description": "Finalisasi peralatan dan koordinasi keluarga.",
      "category": "Persiapan Adat",
      "milestone": "H-1",
      "offsetDays": -1,
      "priority": "HIGH"
    },
    {
      "title": "Briefing mappenre botting dan mappasikarawa",
      "description": "Tunjuk PIC dan konfirmasi kesiapan acara.",
      "category": "Hari H",
      "milestone": "HARI_H",
      "offsetDays": 0,
      "priority": "HIGH"
    }
  ],
  BALI: [
    {
      "title": "Musyawarah dengan pemangku tentang upacara",
      "description": "Diskusikan dan catat versi adat keluarga yang dipilih.",
      "category": "Keluarga & Adat",
      "milestone": "H-365",
      "offsetDays": -365,
      "priority": "HIGH"
    },
    {
      "title": "Booking pemangku / sulinggih dan penata banten",
      "description": "Pastikan kesediaan, biaya, dan ruang lingkup pemandu adat.",
      "category": "Vendor Adat",
      "milestone": "H-180",
      "offsetDays": -180,
      "priority": "HIGH"
    },
    {
      "title": "Fitting Payas Agung / Madya",
      "description": "Cocokkan ukuran, aksesori, dan kebutuhan pergantian busana.",
      "category": "Busana Adat",
      "milestone": "H-90",
      "offsetDays": -90,
      "priority": "MEDIUM"
    },
    {
      "title": "Inventaris sarana mekala-kalaan",
      "description": "Daftar inventaris sesuai arahan pemangku atau keluarga.",
      "category": "Peranti Ritual",
      "milestone": "H-30",
      "offsetDays": -30,
      "priority": "HIGH"
    },
    {
      "title": "Pastikan tata letak upakara dan area suci",
      "description": "Verifikasi urutan, personel, jam mulai, dan antisipasi.",
      "category": "Koordinasi",
      "milestone": "H-7",
      "offsetDays": -7,
      "priority": "HIGH"
    },
    {
      "title": "Konfirmasi ulang urutan doa dan banten",
      "description": "Finalisasi peralatan dan koordinasi keluarga.",
      "category": "Persiapan Adat",
      "milestone": "H-1",
      "offsetDays": -1,
      "priority": "HIGH"
    },
    {
      "title": "Briefing WO agar tidak mengganggu upacara suci",
      "description": "Tunjuk PIC dan konfirmasi kesiapan acara.",
      "category": "Hari H",
      "milestone": "HARI_H",
      "offsetDays": 0,
      "priority": "HIGH"
    }
  ],
  BANJAR: [
    {
      "title": "Musyawarah badatang dan besaran jujuran",
      "description": "Diskusikan dan catat versi adat keluarga yang dipilih.",
      "category": "Keluarga & Adat",
      "milestone": "H-365",
      "offsetDays": -365,
      "priority": "HIGH"
    },
    {
      "title": "Pesan perias Banjar dan koordinator adat",
      "description": "Pastikan kesediaan, biaya, dan ruang lingkup pemandu adat.",
      "category": "Vendor Adat",
      "milestone": "H-180",
      "offsetDays": -180,
      "priority": "HIGH"
    },
    {
      "title": "Fitting busana pengantin Banjar",
      "description": "Cocokkan ukuran, aksesori, dan kebutuhan pergantian busana.",
      "category": "Busana Adat",
      "milestone": "H-90",
      "offsetDays": -90,
      "priority": "MEDIUM"
    },
    {
      "title": "Siapkan jujuran dan perlengkapan batatai",
      "description": "Daftar inventaris sesuai arahan pemangku atau keluarga.",
      "category": "Peranti Ritual",
      "milestone": "H-30",
      "offsetDays": -30,
      "priority": "HIGH"
    },
    {
      "title": "Koordinasi bapapai atau badudus",
      "description": "Verifikasi urutan, personel, jam mulai, dan antisipasi.",
      "category": "Koordinasi",
      "milestone": "H-7",
      "offsetDays": -7,
      "priority": "HIGH"
    },
    {
      "title": "Perawatan dan mandi adat bila dipilih",
      "description": "Finalisasi peralatan dan koordinasi keluarga.",
      "category": "Persiapan Adat",
      "milestone": "H-1",
      "offsetDays": -1,
      "priority": "HIGH"
    },
    {
      "title": "Briefing maarak dan batatai",
      "description": "Tunjuk PIC dan konfirmasi kesiapan acara.",
      "category": "Hari H",
      "milestone": "HARI_H",
      "offsetDays": 0,
      "priority": "HIGH"
    }
  ],
  SASAK: [
    {
      "title": "Sepakati selabar, aji krame dan persetujuan pasangan",
      "description": "Diskusikan dan catat versi adat keluarga yang dipilih.",
      "category": "Keluarga & Adat",
      "milestone": "H-365",
      "offsetDays": -365,
      "priority": "HIGH"
    },
    {
      "title": "Pesan pembayun serta musik nyongkolan",
      "description": "Pastikan kesediaan, biaya, dan ruang lingkup pemandu adat.",
      "category": "Vendor Adat",
      "milestone": "H-180",
      "offsetDays": -180,
      "priority": "HIGH"
    },
    {
      "title": "Fitting busana Sasak dan songket",
      "description": "Cocokkan ukuran, aksesori, dan kebutuhan pergantian busana.",
      "category": "Busana Adat",
      "milestone": "H-90",
      "offsetDays": -90,
      "priority": "MEDIUM"
    },
    {
      "title": "Siapkan perlengkapan sorong serah",
      "description": "Daftar inventaris sesuai arahan pemangku atau keluarga.",
      "category": "Peranti Ritual",
      "milestone": "H-30",
      "offsetDays": -30,
      "priority": "HIGH"
    },
    {
      "title": "Koordinasikan izin dan rute nyongkolan",
      "description": "Verifikasi urutan, personel, jam mulai, dan antisipasi.",
      "category": "Koordinasi",
      "milestone": "H-7",
      "offsetDays": -7,
      "priority": "HIGH"
    },
    {
      "title": "Konfirmasi jadwal akad / sorong serah / nyongkolan",
      "description": "Finalisasi peralatan dan koordinasi keluarga.",
      "category": "Persiapan Adat",
      "milestone": "H-1",
      "offsetDays": -1,
      "priority": "HIGH"
    },
    {
      "title": "Briefing lalu lintas dan keamanan arak-arakan",
      "description": "Tunjuk PIC dan konfirmasi kesiapan acara.",
      "category": "Hari H",
      "milestone": "HARI_H",
      "offsetDays": 0,
      "priority": "HIGH"
    }
  ],
  DAYAK_NGAJU: [
    {
      "title": "Musyawarah Hakumbang Auh dan Jalan Hadat",
      "description": "Diskusikan dan catat versi adat keluarga yang dipilih.",
      "category": "Keluarga & Adat",
      "milestone": "H-365",
      "offsetDays": -365,
      "priority": "HIGH"
    },
    {
      "title": "Pesan mantir / damang serta pemandu adat",
      "description": "Pastikan kesediaan, biaya, dan ruang lingkup pemandu adat.",
      "category": "Vendor Adat",
      "milestone": "H-180",
      "offsetDays": -180,
      "priority": "HIGH"
    },
    {
      "title": "Fitting busana pengantin Ngaju",
      "description": "Cocokkan ukuran, aksesori, dan kebutuhan pergantian busana.",
      "category": "Busana Adat",
      "milestone": "H-90",
      "offsetDays": -90,
      "priority": "MEDIUM"
    },
    {
      "title": "Inventaris sarana Jalan Hadat yang disepakati",
      "description": "Daftar inventaris sesuai arahan pemangku atau keluarga.",
      "category": "Peranti Ritual",
      "milestone": "H-30",
      "offsetDays": -30,
      "priority": "HIGH"
    },
    {
      "title": "Gladi lawang sakepeng dengan properti aman",
      "description": "Verifikasi urutan, personel, jam mulai, dan antisipasi.",
      "category": "Koordinasi",
      "milestone": "H-7",
      "offsetDays": -7,
      "priority": "HIGH"
    },
    {
      "title": "Periksa kesepakatan haluang hapelek",
      "description": "Finalisasi peralatan dan koordinasi keluarga.",
      "category": "Persiapan Adat",
      "milestone": "H-1",
      "offsetDays": -1,
      "priority": "HIGH"
    },
    {
      "title": "Briefing manyaki panganten bila sesuai keyakinan",
      "description": "Tunjuk PIC dan konfirmasi kesiapan acara.",
      "category": "Hari H",
      "milestone": "HARI_H",
      "offsetDays": 0,
      "priority": "HIGH"
    }
  ],
};

// Milestone-based format for checklist-template.tsx component
export interface MilestoneChecklistTask {
  title: string;
  description?: string;
  offsetDays: number;
  priority: "LOW" | "MEDIUM" | "HIGH";
}

export interface MilestoneChecklistTemplate {
  milestone: string;
  name: string;
  description: string;
  tasks: MilestoneChecklistTask[];
}

// Combine all traditions into milestone-based templates for the checklist template component
export const CHECKLIST_MILESTONE_TEMPLATES: MilestoneChecklistTemplate[] = (() => {
  const allItems: ChecklistTemplateItem[] = Object.values(CHECKLIST_TEMPLATES).flat();
  const milestones = ["H-365", "H-180", "H-90", "H-30", "H-7", "H-1"];

  const milestoneNames: Record<string, string> = {
    "H-365": "H-365: Perencanaan Awal",
    "H-180": "H-180: Vendor & Booking",
    "H-90": "H-90: Fitting & Dekorasi",
    "H-30": "H-30: Undangan & Peranti",
    "H-7": "H-7: Finalisasi",
    "H-1": "H-1: Hari Sebelum",
  };

  const milestoneDescriptions: Record<string, string> = {
    "H-365": "Tentukan konsep, budget, dan mulai booking vendor utama.",
    "H-180": "Booking vendor penting dan tentukan detail acara.",
    "H-90": "Fitting busana dan persiapan dekorasi.",
    "H-30": "Sebar undangan dan belanja perlengkapan ritual.",
    "H-7": "Finalisasi semua persiapan dan koordinasi vendor.",
    "H-1": "Prosesi adat terakhir dan persiapan hari H.",
  };

  return milestones.map((m) => ({
    milestone: m,
    name: milestoneNames[m],
    description: milestoneDescriptions[m],
    tasks: allItems
      .filter((item) => item.milestone === m)
      .map((item) => ({
        title: item.title,
        description: item.description,
        offsetDays: item.offsetDays,
        priority: item.priority,
      })),
  })).filter((t) => t.tasks.length > 0);
})();


/**
 * Gunakan ini saat pasangan memilih adat tertentu. Berbeda dari
 * CHECKLIST_MILESTONE_TEMPLATES (legacy), hasilnya TIDAK mencampur seluruh adat.
 * Opsional includeNational untuk menambah tugas umum (hindari duplikat judul).
 */
export function getChecklistMilestoneTemplates(
  tradition: CulturalTradition,
  includeNational = true,
): MilestoneChecklistTemplate[] {
  const core = CHECKLIST_TEMPLATES[tradition];
  const common = includeNational && tradition !== "NASIONAL" ? CHECKLIST_TEMPLATES.NASIONAL : [];
  const byTitle = new Map<string, ChecklistTemplateItem>();
  for (const item of [...common, ...core]) byTitle.set(item.title.toLowerCase(), item);
  const items = [...byTitle.values()];
  const milestones = ["H-365", "H-180", "H-90", "H-30", "H-7", "H-1", "HARI_H"] as const;
  const names: Record<string, string> = {
    "H-365": "Perencanaan Awal", "H-180": "Booking Vendor", "H-90": "Busana & Konsep",
    "H-30": "Peranti & Undangan", "H-7": "Finalisasi", "H-1": "Menjelang Acara",
    "HARI_H": "Pelaksanaan Hari H",
  };
  return milestones.map((milestone) => ({
    milestone,
    name: `${milestone}: ${names[milestone]}`,
    description: "Sesuaikan dengan keluarga, pemandu adat, dan kebutuhan pasangan.",
    tasks: items.filter((item) => item.milestone === milestone).map(({title,description,offsetDays,priority}) =>
      ({title,description,offsetDays,priority})),
  })).filter(({tasks}) => tasks.length > 0);
}
