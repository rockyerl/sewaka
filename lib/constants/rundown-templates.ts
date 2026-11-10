export type CulturalTradition = "JAWA" | "SUNDA" | "MINANG" | "NASIONAL" | "BETAWI" | "BATAK_TOBA" | "MANDAILING" | "ACEH" | "MELAYU_RIAU" | "PALEMBANG" | "LAMPUNG_PEPADUN" | "BUGIS" | "BALI" | "BANJAR" | "SASAK" | "DAYAK_NGAJU";

export interface RitualStep {
  name: string;
  meaning: string;
  equipment: string[];
}

export interface RundownTemplateItem {
  title: string;
  ceremonyType: string;
  timeStart: string;
  timeEnd: string;
  picName: string;
  location: string;
  attire: string;
  rituals: RitualStep[];
  notes: string;
  sortOrder: number;
}

export const RUNDOWN_TEMPLATES: Record<CulturalTradition, RundownTemplateItem[]> = {
  JAWA: [
    {
      title: "Tata Rias, Sanggul & Paes Ageng",
      ceremonyType: "PERSIAPAN",
      timeStart: "05:30",
      timeEnd: "07:30",
      picName: "Pemaes Utama & Tim Busana",
      location: "Kamar Pengantin",
      attire: "Kimono Rias / Jarik Santai",
      rituals: [
        {
          name: "Ngerik & Nyekak",
          meaning: "Membersihkan bulu halus dahi sebagai lambang membuka jalan terang masa depan",
          equipment: ["Pisau cukur baru", "Minyak wangi mawar", "Handuk putih"],
        },
        {
          name: "Pembuatan Cengkorongan Paes",
          meaning: "Bentuk stilasi daun sirih lambang penolak bala dan keindahan wanita Jawa",
          equipment: ["Pidih hitam", "Kuas paes", "Prada emas"],
        },
      ],
      notes: "Pengantin puasa mutih atau sarapan ringan sebelum paes dimulai.",
      sortOrder: 1,
    },
    {
      title: "Prosesi Akad Nikah / Ijab Qabul",
      ceremonyType: "AKAD",
      timeStart: "08:00",
      timeEnd: "09:00",
      picName: "Penghulu, Wali Nikah & Saksi",
      location: "Meja Akad / Masjid Utama",
      attire: "Kebaya Bludru / Putih & Beskap Sikepan Kakung",
      rituals: [
        {
          name: "Ijab Qabul Khidmat",
          meaning: "Perjanjian agung (mitsaqan ghalidza) penyerahan wali kepada mempelai pria",
          equipment: ["Meja akad", "Buku nikah", "Mahar & Mas Kawin"],
        },
        {
          name: "Pemasangan Cincin & Doa Bersama",
          meaning: "Ikatan abadi tanpa ujung dan pangkal",
          equipment: ["Kotak cincin berukir"],
        },
      ],
      notes: "Pastikan berkas KUA dan saksi kedua belah pihak sudah siap 30 menit sebelum acara.",
      sortOrder: 2,
    },
    {
      title: "Upacara Adat Panggih Lengkap",
      ceremonyType: "PANGGIH",
      timeStart: "09:15",
      timeEnd: "10:15",
      picName: "Pambiwara / Pranata Adat",
      location: "Depan Pelaminan",
      attire: "Busana Ageng Jawa Lengkap dengan Ronce Melati",
      rituals: [
        {
          name: "Balang Gantal / Suruh",
          meaning: "Saling melempar lintingan sirih: mempelai pria mengenai dada (cinta kasih), mempelai wanita mengenai paha (kesetiaan)",
          equipment: ["Gantal daun sirih ikat lawe putih"],
        },
        {
          name: "Ngidak Ndog & Wijidadi",
          meaning: "Pengantin pria menginjak telur (pecahnya keperawanan) lalu dibasuh air bunga oleh istri tanda pengabdian",
          equipment: ["Telur ayam kampung", "Baki kuningan", "Bokor air kembang setaman", "Handuk kecil"],
        },
        {
          name: "Sinduran & Timbang (Pangkon)",
          meaning: "Kedua mempelai dinaungi kain sindur oleh ayahanda menuju pelaminan, lalu ditimbang di pangkuan ayah tanda kasih sayang yang adil",
          equipment: ["Kain sindur merah putih"],
        },
        {
          name: "Kacar-Kucur & Dulang-dulangan",
          meaning: "Penyerahan biji-bijian dan uang logam lambang nafkah yang tak boleh tercecer",
          equipment: ["Kain kacar-kucur", "Biji jagung", "Kacang kedelai", "Beras kuning", "Uang koin"],
        },
      ],
      notes: "Gamelan memutar gending Kebo Giro saat prosesi panggih dimulai.",
      sortOrder: 3,
    },
    {
      title: "Sungkeman Pangabekten",
      ceremonyType: "SUNGKEMAN",
      timeStart: "10:15",
      timeEnd: "10:45",
      picName: "Pambiwara & Koordinator Keluarga",
      location: "Depan Pelaminan",
      attire: "Busana Pengantin & Beskap Orang Tua",
      rituals: [
        {
          name: "Sungkeman kepada Ibu & Ayah",
          meaning: "Memohon maaf dan doa restu setulus hati atas segala bimbingan dari buaian hingga mandiri",
          equipment: ["Bantal sungkem bludru empuk"],
        },
      ],
      notes: "Iringan gending Kinanthi atau Ketawang Dhandhanggula bernuansa haru.",
      sortOrder: 4,
    },
    {
      title: "Resepsi Pahargyan Ageng & Ramah Tamah",
      ceremonyType: "RESEPSI",
      timeStart: "11:00",
      timeEnd: "13:30",
      picName: "Wedding Organizer & MC",
      location: "Grand Ballroom / Sasana Handrawina",
      attire: "Busana Pengantin Kraton",
      rituals: [
        {
          name: "Mangayubagyo & Foto Bersama",
          meaning: "Menyambut berkah doa dari sanak kerabat dan sahabat",
          equipment: ["Buku tamu digital / QR Scanner"],
        },
      ],
      notes: "Catering mulai dibuka setelah kirab pengantin tiba di pelaminan.",
      sortOrder: 5,
    },
  ],
  SUNDA: [
    {
      title: "Rias Mahkota Siger Sunda & Ronce Melati",
      ceremonyType: "PERSIAPAN",
      timeStart: "06:00",
      timeEnd: "08:00",
      picName: "MUA Sunda Spesialis Siger",
      location: "Ruang Rias",
      attire: "Kebaya Brokat Putih / Emas & Siger Kencana",
      rituals: [
        {
          name: "Pemasangan Mahkota Siger & Kembang Goyang",
          meaning: "Lambang keanggunan dan kesiapan menjunjung kehormatan keluarga suami",
          equipment: ["Mahkota Siger Sunda", "7 Kembang Goyang", "Ronce melati tibo dada"],
        },
      ],
      notes: "Pastikan bantalan sanggul kokoh agar Siger nyaman dikenakan selama prosesi.",
      sortOrder: 1,
    },
    {
      title: "Prosesi Mapag Panganten (Ki Lengser)",
      ceremonyType: "MAPAG",
      timeStart: "08:15",
      timeEnd: "08:45",
      picName: "Ki Lengser & Tim Penari Jaipong",
      location: "Pintu Masuk Venue",
      attire: "Jas Buka Prangwadana & Bendo Khas Sunda",
      rituals: [
        {
          name: "Tarian Ki Lengser & Pembawa Payung Geulis",
          meaning: "Tarian sukacita sesepuh adat menyambut raja dan ratu sehari",
          equipment: ["Payung geulis Tasikmalaya", "Kipas tari", "Musik degung sunda"],
        },
      ],
      notes: "Ki Lengser memandu rombongan calon mempelai pria menuju meja akad nikah.",
      sortOrder: 2,
    },
    {
      title: "Ijab Qabul Khidmat",
      ceremonyType: "AKAD",
      timeStart: "09:00",
      timeEnd: "10:00",
      picName: "Penghulu & Wali Nikah",
      location: "Meja Akad Utama",
      attire: "Kebaya Sunda & Jas Tutup Senada",
      rituals: [
        {
          name: "Ijab Qabul & Pembacaan Sighat Ta'lik",
          meaning: "Ikrar suci di hadapan Allah SWT dan para saksi",
          equipment: ["Mas kawin", "Al-Qur'an", "Buku nikah"],
        },
      ],
      notes: "Diiringi kecapi suling lembut.",
      sortOrder: 3,
    },
    {
      title: "Upacara Adat Saweran & Meuleum Harupat",
      ceremonyType: "SAWERAN",
      timeStart: "10:15",
      timeEnd: "11:15",
      picName: "Pemandu Adat Sunda",
      location: "Panggung Adat",
      attire: "Busana Pengantin Sunda Lengkap",
      rituals: [
        {
          name: "Sawer Panganten",
          meaning: "Nasihat kehidupan dilantunkan kidung, diselingi menabur beras kuning, koin, permen (hidup manis), dan kunyit",
          equipment: ["Bokor sawer", "Beras kuning", "Uang logam", "Permen"],
        },
        {
          name: "Meuleum Harupat & Nincak Endog",
          meaning: "Membakar lidi dan memadamkannya di kendi air (meredam amarah), lalu menginjak telur dibasuh sang istri",
          equipment: ["7 lidi harupat", "Kendi air tanah liat", "Lilin", "Baki telur"],
        },
        {
          name: "Buka Pintu & Pabetot Bakakak Hayam",
          meaning: "Mengetuk pintu rumah hati istri, dilanjutkan menarik ayam panggang (yang dapat bagian terbesar wajib berbagi rezeki)",
          equipment: ["Bakakak hayam panggang utuh", "Kain penutup pintu"],
        },
      ],
      notes: "Momen pabetot bakakak seringkali menjadi atraksi penuh tawa dan kehangatan keluarga.",
      sortOrder: 4,
    },
    {
      title: "Sungkeman ka Rama & Ibu",
      ceremonyType: "SUNGKEMAN",
      timeStart: "11:15",
      timeEnd: "11:45",
      picName: "Pemandu Adat & MC",
      location: "Pelaminan Sunda",
      attire: "Busana Pengantin Sunda",
      rituals: [
        {
          name: "Neda Kasucian Galih",
          meaning: "Memohon keridhaan dan ampunan mendalam kepada kedua pasang orang tua",
          equipment: ["Bantal sungkem sutra"],
        },
      ],
      notes: "Lantunan pupuh Sunda mengiringi suasana haru.",
      sortOrder: 5,
    },
  ],
  MINANG: [
    {
      title: "Pemasangan Suntiang Gadang & Rias Anak Daro",
      ceremonyType: "PERSIAPAN",
      timeStart: "06:00",
      timeEnd: "08:15",
      picName: "Tukang Pasang Suntiang Khas Minang",
      location: "Bilik Rumah Gadang / Hotel",
      attire: "Baju Batabue Beludru & Sarung Songket Silungkang",
      rituals: [
        {
          name: "Menyusun Suntiang 9-11 Tingkat",
          meaning: "Keagungan wanita Minang di rumah gadang, memikul tanggung jawab dengan keteguhan hati",
          equipment: ["Suntiang emas bertingkat", "Kembang goyang", "Kote-kote pipi"],
        },
      ],
      notes: "Anak Daro disiapkan penyangga leher jika diperlukan kenyamanan ekstra.",
      sortOrder: 1,
    },
    {
      title: "Penyambutan Marapulai & Tari Pasambahan",
      ceremonyType: "PENYAMBUTAN",
      timeStart: "08:45",
      timeEnd: "09:30",
      picName: "Ninik Mamak & Penari Pasambahan",
      location: "Halaman Depan Pelaminan",
      attire: "Marapulai Baju Roki & Saluak Deta Emas",
      rituals: [
        {
          name: "Tari Pasambahan & Carano Siriah",
          meaning: "Pemberian sirih dalam carano perak tanda penghormatan menerima kedatangan keluarga besan",
          equipment: ["Carano kuningan/perak", "Sirih pinang pinang", "Payung kuning kebesaran"],
        },
      ],
      notes: "Tabuhan gendang tasa dan talempong mengiringi langkah rombongan marapulai.",
      sortOrder: 2,
    },
    {
      title: "Ijab Qabul Khidmat",
      ceremonyType: "AKAD",
      timeStart: "09:30",
      timeEnd: "10:30",
      picName: "KUA & Saksi Ninik Mamak",
      location: "Meja Akad",
      attire: "Busana Muslim Adat Minang",
      rituals: [
        {
          name: "Akad Nikah Syarak",
          meaning: "Pengikatan janji suci berlandaskan syariat Islam yang kokoh",
          equipment: ["Perlengkapan mahar", "Buku nikah"],
        },
      ],
      notes: "Keluarga kedua belah pihak duduk melingkar bersila.",
      sortOrder: 3,
    },
    {
      title: "Pemberian Gelar Marapulai & Basandiang",
      ceremonyType: "ADAT_MINANG",
      timeStart: "10:45",
      timeEnd: "11:30",
      picName: "Tetua Adat / Ninik Mamak",
      location: "Pelaminan Rumah Gadang",
      attire: "Pakaian Adat Minang Lengkap",
      rituals: [
        {
          name: "Malewakan Gala Marapulai",
          meaning: "Ketintingan gelar adat kedewasaan bagi mempelai pria (contoh: Sutan Bagindo)",
          equipment: ["Keris marapulai", "Tanduak siriah"],
        },
        {
          name: "Basandiang di Pelaminan",
          meaning: "Kedua pengantin resmi bersanding di pelaminan megah bertirai marun dan emas",
          equipment: ["Bantal godang", "Tirai songket"],
        },
      ],
      notes: "Ninik mamak mengumumkan gelar baru marapulai di hadapan hadirin.",
      sortOrder: 4,
    },
    {
      title: "Makan Bajamba & Resepsi Baralek Gadang",
      ceremonyType: "RESEPSI",
      timeStart: "11:30",
      timeEnd: "14:00",
      picName: "Tim Baralek & Catering",
      location: "Ballroom / Balai Adat",
      attire: "Busana Pengantin Minang Suntiang",
      rituals: [
        {
          name: "Makan Bajamba",
          meaning: "Makan bersama satu dulang melambangkan kebersamaan dan kesetaraan tanpa kasta",
          equipment: ["Jamba dulang lauk pauk khas Minang"],
        },
      ],
      notes: "Atraksi Tari Piring dengan injak beling sering disajikan sebagai hiburan kehormatan.",
      sortOrder: 5,
    },
  ],
  NASIONAL: [
    {
      title: "Persiapan & Rias Pengantin",
      ceremonyType: "PERSIAPAN",
      timeStart: "06:00",
      timeEnd: "08:00",
      picName: "MUA & Stylist",
      location: "Bridal Suite",
      attire: "Robe Bridal",
      rituals: [
        {
          name: "Hair & Makeup Styling",
          meaning: "Menampilkan pesona terbaik pengantin di hari bersejarah",
          equipment: ["Makeup kit", "Hair accessories"],
        },
      ],
      notes: "Sesi foto first look sebelum akad dimulai.",
      sortOrder: 1,
    },
    {
      title: "Akad Nikah / Pemberkatan Suci",
      ceremonyType: "AKAD",
      timeStart: "08:30",
      timeEnd: "10:00",
      picName: "Pemuka Agama / Penghulu",
      location: "Main Stage / Altar",
      attire: "Kebaya Nasional / Gaun Putih & Jas Formal",
      rituals: [
        {
          name: "Ikrar Janji Suci & Tukar Cincin",
          meaning: "Penyatuan dua insan dalam ikatan suci pernikahan",
          equipment: ["Cincin pernikahan", "Dokumen pernikahan"],
        },
      ],
      notes: "Dipandu MC formal khidmat.",
      sortOrder: 2,
    },
    {
      title: "Sungkeman & Restu Orang Tua",
      ceremonyType: "SUNGKEMAN",
      timeStart: "10:00",
      timeEnd: "10:45",
      picName: "Koordinator Acara",
      location: "Pelaminan",
      attire: "Busana Pengantin & Keluarga",
      rituals: [
        {
          name: "Ungkapan Bakti kepada Orang Tua",
          meaning: "Mencium tangan orang tua memohon bekal doa restu seumur hidup",
          equipment: ["Bantal sungkem"],
        },
      ],
      notes: "Diringi alunan instrumen piano / biola klasik.",
      sortOrder: 3,
    },
    {
      title: "Resepsi Pernikahan & Ramah Tamah",
      ceremonyType: "RESEPSI",
      timeStart: "11:00",
      timeEnd: "13:30",
      picName: "Wedding Organizer & MC",
      location: "Grand Ballroom",
      attire: "Busana Resepsi",
      rituals: [
        {
          name: "Wedding Toast & Hand Bouquet Toss",
          meaning: "Perayaan kegembiraan bersama sanak kerabat dan teman terdekat",
          equipment: ["Hand bouquet mawar putih", "Gelas toast"],
        },
      ],
      notes: "Live music akustik menemani santap siang para tamu undangan.",
      sortOrder: 4,
    },
  ],

  // --- ADAT TAMBAHAN: jadwal simulasi, sesuaikan pakem keluarga ---
  BETAWI: [
    {
      "title": "Rias Pengantin Betawi",
      "ceremonyType": "PERSIAPAN",
      "picName": "MUA adat Betawi",
      "location": "Ruang rias",
      "attire": "Busana Betawi",
      "rituals": [
        {
          "name": "Pemasangan busana Betawi",
          "meaning": "Menyiapkan pengantin sesuai pilihan gaya Betawi.",
          "equipment": [
            "Busana pengantin",
            "Aksesori kepala"
          ]
        }
      ],
      "notes": "Estimasi operasional; cocokkan dengan pemandu adat, keluarga, dan pemuka agama.",
      "timeStart": "06:00",
      "timeEnd": "07:30",
      "sortOrder": 1
    },
    {
      "title": "Ngerudat & Buka Palang Pintu",
      "ceremonyType": "PENYAMBUTAN",
      "picName": "Jawara Palang Pintu & MC",
      "location": "Gerbang venue",
      "attire": "Busana Betawi dan pesilat",
      "rituals": [
        {
          "name": "Balas Pantun dan Atraksi Silat",
          "meaning": "Dialog penghormatan menyambut rombongan mempelai.",
          "equipment": [
            "Pengeras suara",
            "Properti silat aman"
          ]
        },
        {
          "name": "Arak-arakan Hantaran",
          "meaning": "Kedatangan mempelai bersama keluarga dan perlengkapan seserahan.",
          "equipment": [
            "Roti buaya",
            "Hantaran"
          ]
        }
      ],
      "notes": "Atraksi silat harus terkoreografi dan menggunakan properti aman.",
      "timeStart": "08:00",
      "timeEnd": "08:45",
      "sortOrder": 2
    },
    {
      "title": "Akad Nikah",
      "ceremonyType": "AKAD",
      "picName": "Penghulu dan wali",
      "location": "Area akad",
      "attire": "Busana akad Betawi",
      "rituals": [
        {
          "name": "Ijab Kabul dan Doa",
          "meaning": "Pengesahan pernikahan sesuai agama dan ketentuan yang berlaku.",
          "equipment": [
            "Dokumen nikah",
            "Mahar"
          ]
        }
      ],
      "notes": "Estimasi operasional; cocokkan dengan pemandu adat, keluarga, dan pemuka agama.",
      "timeStart": "09:00",
      "timeEnd": "10:00",
      "sortOrder": 3
    },
    {
      "title": "Penyerahan Roti Buaya dan Restu",
      "ceremonyType": "UPACARA_ADAT",
      "picName": "MC & koordinator keluarga",
      "location": "Pelaminan",
      "attire": "Busana adat Betawi",
      "rituals": [
        {
          "name": "Simbol Roti Buaya",
          "meaning": "Roti buaya kerap dimaknai sebagai kesetiaan pasangan.",
          "equipment": [
            "Roti buaya"
          ]
        },
        {
          "name": "Doa Keluarga",
          "meaning": "Penerimaan kedua keluarga dan permohonan restu.",
          "equipment": [
            "Mikrofon"
          ]
        }
      ],
      "notes": "Estimasi operasional; cocokkan dengan pemandu adat, keluarga, dan pemuka agama.",
      "timeStart": "10:15",
      "timeEnd": "11:15",
      "sortOrder": 4
    },
    {
      "title": "Resepsi Kebesaran Betawi",
      "ceremonyType": "RESEPSI",
      "picName": "Wedding Organizer",
      "location": "Area resepsi",
      "attire": "Busana adat Betawi",
      "rituals": [
        {
          "name": "Duduk di Puade dan Salam Tamu",
          "meaning": "Menjamu tamu dan keluarga besar.",
          "equipment": [
            "Pelaminan",
            "Buku tamu"
          ]
        }
      ],
      "notes": "Estimasi operasional; cocokkan dengan pemandu adat, keluarga, dan pemuka agama.",
      "timeStart": "11:30",
      "timeEnd": "13:30",
      "sortOrder": 5
    }
  ],
  BATAK_TOBA: [
    {
      "title": "Persiapan Busana Ulos dan Keluarga",
      "ceremonyType": "PERSIAPAN",
      "picName": "Perias & koordinator keluarga",
      "location": "Ruang rias",
      "attire": "Busana Batak Toba",
      "rituals": [
        {
          "name": "Persiapan Ulos",
          "meaning": "Menata ulos sesuai peran pemberi dan penerima.",
          "equipment": [
            "Ulos",
            "Daftar marga"
          ]
        }
      ],
      "notes": "Estimasi operasional; cocokkan dengan pemandu adat, keluarga, dan pemuka agama.",
      "timeStart": "06:00",
      "timeEnd": "07:30",
      "sortOrder": 1
    },
    {
      "title": "Penerimaan Rombongan dan Marsibuhabuhai",
      "ceremonyType": "PENYAMBUTAN",
      "picName": "Raja Parhata & keluarga",
      "location": "Area kedatangan",
      "attire": "Busana adat keluarga",
      "rituals": [
        {
          "name": "Marsibuhabuhai",
          "meaning": "Pertemuan dan jamuan awal keluarga sesuai kesepakatan adat.",
          "equipment": [
            "Hidangan keluarga"
          ]
        }
      ],
      "notes": "Estimasi operasional; cocokkan dengan pemandu adat, keluarga, dan pemuka agama.",
      "timeStart": "08:00",
      "timeEnd": "08:45",
      "sortOrder": 2
    },
    {
      "title": "Pemberkatan / Upacara Pernikahan",
      "ceremonyType": "PEMBERKATAN",
      "picName": "Pemuka agama",
      "location": "Rumah ibadah / venue",
      "attire": "Busana pengantin",
      "rituals": [
        {
          "name": "Ikrar Perkawinan",
          "meaning": "Dilaksanakan sesuai agama pasangan; pemberkatan gereja bukan syarat bagi semua pasangan.",
          "equipment": [
            "Dokumen sesuai agama",
            "Cincin"
          ]
        }
      ],
      "notes": "Estimasi operasional; cocokkan dengan pemandu adat, keluarga, dan pemuka agama.",
      "timeStart": "09:00",
      "timeEnd": "10:00",
      "sortOrder": 3
    },
    {
      "title": "Ulaon Unjuk, Jambar, dan Mangulosi",
      "ceremonyType": "UPACARA_ADAT",
      "picName": "Raja Parhata & perwakilan marga",
      "location": "Gedung adat",
      "attire": "Busana Batak Toba",
      "rituals": [
        {
          "name": "Pembagian Jambar",
          "meaning": "Penghormatan hubungan kekerabatan melalui pembagian bagian adat.",
          "equipment": [
            "Perlengkapan jamuan adat"
          ]
        },
        {
          "name": "Mangulosi dan Tortor",
          "meaning": "Pemberian ulos dan nasihat keluarga; tortor mengiringi penghormatan.",
          "equipment": [
            "Ulos sesuai peran",
            "Musik gondang"
          ]
        }
      ],
      "notes": "Waktu dapat jauh lebih panjang dari contoh; tetapkan siapa pemberi ulos.",
      "timeStart": "10:15",
      "timeEnd": "11:15",
      "sortOrder": 4
    },
    {
      "title": "Jamuan dan Foto Keluarga Marga",
      "ceremonyType": "RESEPSI",
      "picName": "WO & koordinator marga",
      "location": "Area makan",
      "attire": "Busana adat",
      "rituals": [
        {
          "name": "Ramah Tamah Keluarga",
          "meaning": "Menyambut kerabat kedua belah pihak.",
          "equipment": [
            "Daftar urutan foto"
          ]
        }
      ],
      "notes": "Estimasi operasional; cocokkan dengan pemandu adat, keluarga, dan pemuka agama.",
      "timeStart": "11:30",
      "timeEnd": "13:30",
      "sortOrder": 5
    }
  ],
  MANDAILING: [
    {
      "title": "Rias Bulang dan Ampu",
      "ceremonyType": "PERSIAPAN",
      "picName": "Perias adat",
      "location": "Ruang rias",
      "attire": "Busana Mandailing",
      "rituals": [
        {
          "name": "Pemasangan Aksesori Pengantin",
          "meaning": "Menyiapkan busana Mandailing dan aksesori kepala.",
          "equipment": [
            "Bulang",
            "Ampu"
          ]
        }
      ],
      "notes": "Estimasi operasional; cocokkan dengan pemandu adat, keluarga, dan pemuka agama.",
      "timeStart": "06:00",
      "timeEnd": "07:30",
      "sortOrder": 1
    },
    {
      "title": "Mangalo-alo Boru",
      "ceremonyType": "PENYAMBUTAN",
      "picName": "Kahanggi, Anak Boru, Mora",
      "location": "Area kedatangan",
      "attire": "Busana adat keluarga",
      "rituals": [
        {
          "name": "Penyambutan Rombongan",
          "meaning": "Menerima mempelai dan keluarga sesuai susunan adat.",
          "equipment": [
            "Daftar rombongan",
            "Perlengkapan penyambutan"
          ]
        }
      ],
      "notes": "Estimasi operasional; cocokkan dengan pemandu adat, keluarga, dan pemuka agama.",
      "timeStart": "08:00",
      "timeEnd": "08:45",
      "sortOrder": 2
    },
    {
      "title": "Akad / Pengesahan Pernikahan",
      "ceremonyType": "AKAD",
      "picName": "Pemuka agama & keluarga",
      "location": "Area akad / rumah ibadah",
      "attire": "Busana pernikahan",
      "rituals": [
        {
          "name": "Pengesahan Sesuai Agama",
          "meaning": "Rangkaian pengesahan mengikuti ketentuan agama pasangan.",
          "equipment": [
            "Berkas sesuai agama"
          ]
        }
      ],
      "notes": "Estimasi operasional; cocokkan dengan pemandu adat, keluarga, dan pemuka agama.",
      "timeStart": "09:00",
      "timeEnd": "10:00",
      "sortOrder": 3
    },
    {
      "title": "Mata Ni Horja, Markobar, dan Mangupa",
      "ceremonyType": "UPACARA_ADAT",
      "picName": "Raja Adat & Dalihan Na Tolu",
      "location": "Area adat",
      "attire": "Busana Mandailing",
      "rituals": [
        {
          "name": "Markobar dan Tortor",
          "meaning": "Petuah serta tata hormat antar kelompok kekerabatan.",
          "equipment": [
            "Mikrofon",
            "Pengiring gondang"
          ]
        },
        {
          "name": "Mangupa",
          "meaning": "Pemberian pesan dan doa restu bagi pengantin.",
          "equipment": [
            "Perlengkapan mangupa disetujui tetua"
          ]
        }
      ],
      "notes": "Jadwal horja godang tradisional bisa multi-hari; ini versi ringkas.",
      "timeStart": "10:15",
      "timeEnd": "11:15",
      "sortOrder": 4
    },
    {
      "title": "Jamuan Keluarga Mandailing",
      "ceremonyType": "RESEPSI",
      "picName": "WO & keluarga",
      "location": "Area jamuan",
      "attire": "Busana adat",
      "rituals": [
        {
          "name": "Makan Bersama",
          "meaning": "Kebersamaan kerabat besar setelah upacara.",
          "equipment": [
            "Hidangan",
            "Daftar undangan"
          ]
        }
      ],
      "notes": "Estimasi operasional; cocokkan dengan pemandu adat, keluarga, dan pemuka agama.",
      "timeStart": "11:30",
      "timeEnd": "13:30",
      "sortOrder": 5
    }
  ],
  ACEH: [
    {
      "title": "Rias Dara Baro dan Linto Baro",
      "ceremonyType": "PERSIAPAN",
      "picName": "MUA Aceh",
      "location": "Ruang rias",
      "attire": "Busana adat Aceh",
      "rituals": [
        {
          "name": "Penataan Busana Aceh",
          "meaning": "Menyiapkan aksesori kepala dan busana sesuai adat daerah keluarga.",
          "equipment": [
            "Busana adat",
            "Aksesori"
          ]
        }
      ],
      "notes": "Estimasi operasional; cocokkan dengan pemandu adat, keluarga, dan pemuka agama.",
      "timeStart": "06:00",
      "timeEnd": "07:30",
      "sortOrder": 1
    },
    {
      "title": "Intat Linto dan Penyambutan",
      "ceremonyType": "PENYAMBUTAN",
      "picName": "Koordinator keluarga & MC adat",
      "location": "Pintu masuk",
      "attire": "Busana adat Aceh",
      "rituals": [
        {
          "name": "Intat Linto",
          "meaning": "Rombongan mengantar pengantin pria dalam tata sambut keluarga.",
          "equipment": [
            "Sirih adat",
            "Hantaran"
          ]
        }
      ],
      "notes": "Estimasi operasional; cocokkan dengan pemandu adat, keluarga, dan pemuka agama.",
      "timeStart": "08:00",
      "timeEnd": "08:45",
      "sortOrder": 2
    },
    {
      "title": "Akad Nikah",
      "ceremonyType": "AKAD",
      "picName": "Penghulu, wali, dan saksi",
      "location": "Area akad",
      "attire": "Busana akad",
      "rituals": [
        {
          "name": "Ijab Kabul",
          "meaning": "Pengesahan perkawinan menurut ketentuan agama dan negara.",
          "equipment": [
            "Berkas KUA",
            "Mahar"
          ]
        }
      ],
      "notes": "Estimasi operasional; cocokkan dengan pemandu adat, keluarga, dan pemuka agama.",
      "timeStart": "09:00",
      "timeEnd": "10:00",
      "sortOrder": 3
    },
    {
      "title": "Peusijuek dan Persandingan",
      "ceremonyType": "UPACARA_ADAT",
      "picName": "Tokoh adat & tetua",
      "location": "Pelaminan",
      "attire": "Busana adat Aceh",
      "rituals": [
        {
          "name": "Peusijuek",
          "meaning": "Percikan tepung tawar dan doa sebagai ungkapan syukur serta permohonan berkah.",
          "equipment": [
            "Beras padi",
            "Air tepung tawar",
            "Daun peusijuek",
            "Bu leukat"
          ]
        },
        {
          "name": "Doa dan Nasihat",
          "meaning": "Keluarga memberikan restu kepada pasangan.",
          "equipment": [
            "Mikrofon"
          ]
        }
      ],
      "notes": "Bahan peusijuek disiapkan oleh pemandu adat; urutan lokal bervariasi.",
      "timeStart": "10:15",
      "timeEnd": "11:15",
      "sortOrder": 4
    },
    {
      "title": "Jamuan Adat Aceh",
      "ceremonyType": "RESEPSI",
      "picName": "WO & keluarga",
      "location": "Area resepsi",
      "attire": "Busana Aceh",
      "rituals": [
        {
          "name": "Ramah Tamah",
          "meaning": "Jamuan untuk keluarga dan tamu.",
          "equipment": [
            "Jamuan",
            "Buku tamu"
          ]
        }
      ],
      "notes": "Estimasi operasional; cocokkan dengan pemandu adat, keluarga, dan pemuka agama.",
      "timeStart": "11:30",
      "timeEnd": "13:30",
      "sortOrder": 5
    }
  ],
  MELAYU_RIAU: [
    {
      "title": "Rias dan Busana Melayu",
      "ceremonyType": "PERSIAPAN",
      "picName": "MUA Melayu",
      "location": "Ruang rias",
      "attire": "Baju kurung dan teluk belanga",
      "rituals": [
        {
          "name": "Persiapan Tanjak / Aksesori",
          "meaning": "Menata busana dan perlengkapan Melayu.",
          "equipment": [
            "Tanjak",
            "Songket"
          ]
        }
      ],
      "notes": "Estimasi operasional; cocokkan dengan pemandu adat, keluarga, dan pemuka agama.",
      "timeStart": "06:00",
      "timeEnd": "07:30",
      "sortOrder": 1
    },
    {
      "title": "Arak Pengantin dan Pantun Adat",
      "ceremonyType": "PENYAMBUTAN",
      "picName": "MC adat & keluarga",
      "location": "Pintu venue",
      "attire": "Busana Melayu",
      "rituals": [
        {
          "name": "Berbalas Pantun",
          "meaning": "Tukar sapa penuh kesantunan antarkeluarga.",
          "equipment": [
            "Mikrofon",
            "Tepak sirih"
          ]
        }
      ],
      "notes": "Estimasi operasional; cocokkan dengan pemandu adat, keluarga, dan pemuka agama.",
      "timeStart": "08:00",
      "timeEnd": "08:45",
      "sortOrder": 2
    },
    {
      "title": "Akad Nikah",
      "ceremonyType": "AKAD",
      "picName": "Penghulu & wali",
      "location": "Area akad",
      "attire": "Busana Melayu",
      "rituals": [
        {
          "name": "Ijab Kabul",
          "meaning": "Pernyataan nikah menurut ketentuan agama.",
          "equipment": [
            "Mahar",
            "Berkas KUA"
          ]
        }
      ],
      "notes": "Estimasi operasional; cocokkan dengan pemandu adat, keluarga, dan pemuka agama.",
      "timeStart": "09:00",
      "timeEnd": "10:00",
      "sortOrder": 3
    },
    {
      "title": "Tepuk Tepung Tawar dan Bersanding",
      "ceremonyType": "UPACARA_ADAT",
      "picName": "Tetua adat Melayu",
      "location": "Pelaminan",
      "attire": "Songket Melayu",
      "rituals": [
        {
          "name": "Tepuk Tepung Tawar",
          "meaning": "Doa dan ungkapan restu yang dipandu tetua.",
          "equipment": [
            "Air tepung tawar",
            "Daun percik"
          ]
        },
        {
          "name": "Bersanding",
          "meaning": "Penerimaan pasangan oleh kedua keluarga.",
          "equipment": [
            "Pelaminan"
          ]
        }
      ],
      "notes": "Estimasi operasional; cocokkan dengan pemandu adat, keluarga, dan pemuka agama.",
      "timeStart": "10:15",
      "timeEnd": "11:15",
      "sortOrder": 4
    },
    {
      "title": "Jamuan & Silaturahmi Melayu",
      "ceremonyType": "RESEPSI",
      "picName": "WO & keluarga",
      "location": "Ruang resepsi",
      "attire": "Busana Melayu",
      "rituals": [
        {
          "name": "Jamuan Keluarga",
          "meaning": "Makan bersama dengan keluarga dan undangan.",
          "equipment": [
            "Hidangan",
            "Buku tamu"
          ]
        }
      ],
      "notes": "Estimasi operasional; cocokkan dengan pemandu adat, keluarga, dan pemuka agama.",
      "timeStart": "11:30",
      "timeEnd": "13:30",
      "sortOrder": 5
    }
  ],
  PALEMBANG: [
    {
      "title": "Rias Aesan Gede / Paksangko",
      "ceremonyType": "PERSIAPAN",
      "picName": "Perias adat Palembang",
      "location": "Ruang rias",
      "attire": "Busana Aesan",
      "rituals": [
        {
          "name": "Pemasangan Busana Aesan",
          "meaning": "Menyiapkan aksesori kebesaran sesuai pilihan keluarga.",
          "equipment": [
            "Songket",
            "Aksesori kepala"
          ]
        }
      ],
      "notes": "Estimasi operasional; cocokkan dengan pemandu adat, keluarga, dan pemuka agama.",
      "timeStart": "06:00",
      "timeEnd": "07:30",
      "sortOrder": 1
    },
    {
      "title": "Arak-arakan Pengantin Pria",
      "ceremonyType": "PENYAMBUTAN",
      "picName": "MC & keluarga",
      "location": "Akses venue",
      "attire": "Busana adat Palembang",
      "rituals": [
        {
          "name": "Rombongan Hantaran",
          "meaning": "Menerima kedatangan pengantin pria beserta perlengkapan yang disepakati.",
          "equipment": [
            "Hantaran",
            "Musik pengiring"
          ]
        }
      ],
      "notes": "Estimasi operasional; cocokkan dengan pemandu adat, keluarga, dan pemuka agama.",
      "timeStart": "08:00",
      "timeEnd": "08:45",
      "sortOrder": 2
    },
    {
      "title": "Akad Nikah",
      "ceremonyType": "AKAD",
      "picName": "Penghulu / pemuka agama",
      "location": "Area akad",
      "attire": "Busana adat",
      "rituals": [
        {
          "name": "Pengesahan Pernikahan",
          "meaning": "Pernikahan diselenggarakan menurut agama pasangan.",
          "equipment": [
            "Mahar",
            "Dokumen"
          ]
        }
      ],
      "notes": "Estimasi operasional; cocokkan dengan pemandu adat, keluarga, dan pemuka agama.",
      "timeStart": "09:00",
      "timeEnd": "10:00",
      "sortOrder": 3
    },
    {
      "title": "Prosesi Munggah",
      "ceremonyType": "UPACARA_ADAT",
      "picName": "Tetua adat Palembang",
      "location": "Pelaminan",
      "attire": "Aesan Gede / Paksangko",
      "rituals": [
        {
          "name": "Munggah dan Pertemuan Pengantin",
          "meaning": "Puncak prosesi pertemuan dan penerimaan mempelai.",
          "equipment": [
            "Pelaminan",
            "Hantaran"
          ]
        },
        {
          "name": "Nasihat dan Restu",
          "meaning": "Keluarga memberi petuah sesuai tradisi.",
          "equipment": [
            "Mikrofon"
          ]
        }
      ],
      "notes": "Urutan munggah dan akad dapat berbeda; sepakati dengan sesepuh.",
      "timeStart": "10:15",
      "timeEnd": "11:15",
      "sortOrder": 4
    },
    {
      "title": "Resepsi dan Tari Pagar Pengantin (Opsional)",
      "ceremonyType": "RESEPSI",
      "picName": "WO & tim tari",
      "location": "Area resepsi",
      "attire": "Aesan Palembang",
      "rituals": [
        {
          "name": "Jamuan dan Hiburan",
          "meaning": "Pesta keluarga; pertunjukan tari dipilih bila relevan.",
          "equipment": [
            "Musik",
            "Hidangan"
          ]
        }
      ],
      "notes": "Estimasi operasional; cocokkan dengan pemandu adat, keluarga, dan pemuka agama.",
      "timeStart": "11:30",
      "timeEnd": "13:30",
      "sortOrder": 5
    }
  ],
  LAMPUNG_PEPADUN: [
    {
      "title": "Rias Siger dan Kain Tapis",
      "ceremonyType": "PERSIAPAN",
      "picName": "Perias adat Lampung",
      "location": "Ruang rias",
      "attire": "Siger dan tapis",
      "rituals": [
        {
          "name": "Pemasangan Siger",
          "meaning": "Menata busana dan aksesori sesuai kelompok adat keluarga.",
          "equipment": [
            "Siger",
            "Kain tapis"
          ]
        }
      ],
      "notes": "Estimasi operasional; cocokkan dengan pemandu adat, keluarga, dan pemuka agama.",
      "timeStart": "06:00",
      "timeEnd": "07:30",
      "sortOrder": 1
    },
    {
      "title": "Penyambutan Rombongan Keluarga",
      "ceremonyType": "PENYAMBUTAN",
      "picName": "Koordinator adat",
      "location": "Pintu venue",
      "attire": "Busana Lampung",
      "rituals": [
        {
          "name": "Penyambutan Adat",
          "meaning": "Penerimaan dan pengaturan tempat keluarga.",
          "equipment": [
            "Daftar rombongan"
          ]
        }
      ],
      "notes": "Estimasi operasional; cocokkan dengan pemandu adat, keluarga, dan pemuka agama.",
      "timeStart": "08:00",
      "timeEnd": "08:45",
      "sortOrder": 2
    },
    {
      "title": "Akad / Pengesahan Pernikahan",
      "ceremonyType": "AKAD",
      "picName": "Pemuka agama dan keluarga",
      "location": "Area akad / rumah ibadah",
      "attire": "Busana pilihan",
      "rituals": [
        {
          "name": "Pengesahan Sesuai Agama",
          "meaning": "Proses legal dan keagamaan terpisah dari adat.",
          "equipment": [
            "Dokumen yang relevan"
          ]
        }
      ],
      "notes": "Estimasi operasional; cocokkan dengan pemandu adat, keluarga, dan pemuka agama.",
      "timeStart": "09:00",
      "timeEnd": "10:00",
      "sortOrder": 3
    },
    {
      "title": "Begawi / Pengukuhan Gelar (Jika Dipilih)",
      "ceremonyType": "UPACARA_ADAT",
      "picName": "Penyimbang & tetua adat",
      "location": "Balai adat",
      "attire": "Busana Lampung",
      "rituals": [
        {
          "name": "Cangget dan Penghormatan Adat",
          "meaning": "Seni pertunjukan dan urutan penghormatan sesuai keputusan pemangku adat.",
          "equipment": [
            "Perlengkapan cangget"
          ]
        },
        {
          "name": "Pengumuman Gelar (Opsional)",
          "meaning": "Pengukuhan hanya bila menjadi bagian begawi keluarga.",
          "equipment": [
            "Naskah gelar"
          ]
        }
      ],
      "notes": "Begawi lengkap dapat berlangsung beberapa hari; jangan otomatis memadatkan seluruh ritual.",
      "timeStart": "10:15",
      "timeEnd": "11:15",
      "sortOrder": 4
    },
    {
      "title": "Resepsi Adat Lampung",
      "ceremonyType": "RESEPSI",
      "picName": "WO & keluarga",
      "location": "Area jamuan",
      "attire": "Busana Lampung",
      "rituals": [
        {
          "name": "Silaturahmi Keluarga",
          "meaning": "Menjamu undangan sambil merawat tata hormat adat.",
          "equipment": [
            "Hidangan",
            "Buku tamu"
          ]
        }
      ],
      "notes": "Estimasi operasional; cocokkan dengan pemandu adat, keluarga, dan pemuka agama.",
      "timeStart": "11:30",
      "timeEnd": "13:30",
      "sortOrder": 5
    }
  ],
  BUGIS: [
    {
      "title": "Rias Baju Bodo dan Lipa Sabbe",
      "ceremonyType": "PERSIAPAN",
      "picName": "MUA Bugis",
      "location": "Ruang rias",
      "attire": "Busana Bugis",
      "rituals": [
        {
          "name": "Pemasangan Busana",
          "meaning": "Penataan baju bodo dan songket/sutra sesuai pilihan.",
          "equipment": [
            "Baju bodo",
            "Lipa sabbe"
          ]
        }
      ],
      "notes": "Estimasi operasional; cocokkan dengan pemandu adat, keluarga, dan pemuka agama.",
      "timeStart": "06:00",
      "timeEnd": "07:30",
      "sortOrder": 1
    },
    {
      "title": "Mappenre Botting",
      "ceremonyType": "PENYAMBUTAN",
      "picName": "Koordinator keluarga & MC",
      "location": "Pintu venue",
      "attire": "Busana Bugis",
      "rituals": [
        {
          "name": "Pengantaran Mempelai Pria",
          "meaning": "Kedatangan rombongan dan hantaran yang disepakati.",
          "equipment": [
            "Hantaran",
            "Bosara"
          ]
        }
      ],
      "notes": "Estimasi operasional; cocokkan dengan pemandu adat, keluarga, dan pemuka agama.",
      "timeStart": "08:00",
      "timeEnd": "08:45",
      "sortOrder": 2
    },
    {
      "title": "Akad Nikah",
      "ceremonyType": "AKAD",
      "picName": "Penghulu & wali",
      "location": "Area akad",
      "attire": "Busana Bugis",
      "rituals": [
        {
          "name": "Ijab Kabul",
          "meaning": "Pernikahan sesuai agama dan ketentuan negara.",
          "equipment": [
            "Mahar",
            "Berkas KUA"
          ]
        }
      ],
      "notes": "Estimasi operasional; cocokkan dengan pemandu adat, keluarga, dan pemuka agama.",
      "timeStart": "09:00",
      "timeEnd": "10:00",
      "sortOrder": 3
    },
    {
      "title": "Mappasikarawa dan Tudang Botting",
      "ceremonyType": "UPACARA_ADAT",
      "picName": "Tetua adat Bugis",
      "location": "Pelaminan",
      "attire": "Busana pengantin Bugis",
      "rituals": [
        {
          "name": "Mappasikarawa (Jika Dipilih)",
          "meaning": "Pertemuan simbolis pasangan menurut panduan adat setempat.",
          "equipment": [
            "Perlengkapan yang disepakati"
          ]
        },
        {
          "name": "Tudang Botting",
          "meaning": "Pengantin duduk bersanding menerima restu.",
          "equipment": [
            "Pelaminan"
          ]
        }
      ],
      "notes": "Estimasi operasional; cocokkan dengan pemandu adat, keluarga, dan pemuka agama.",
      "timeStart": "10:15",
      "timeEnd": "11:15",
      "sortOrder": 4
    },
    {
      "title": "Resepsi dan Mapparola (Sesuai Kesepakatan)",
      "ceremonyType": "RESEPSI",
      "picName": "WO & keluarga",
      "location": "Gedung / rumah",
      "attire": "Busana Bugis",
      "rituals": [
        {
          "name": "Jamuan Keluarga",
          "meaning": "Ramah tamah; kunjungan balasan dapat dijadwalkan terpisah.",
          "equipment": [
            "Hidangan"
          ]
        }
      ],
      "notes": "Estimasi operasional; cocokkan dengan pemandu adat, keluarga, dan pemuka agama.",
      "timeStart": "11:30",
      "timeEnd": "13:30",
      "sortOrder": 5
    }
  ],
  BALI: [
    {
      "title": "Rias Payas Agung / Madya",
      "ceremonyType": "PERSIAPAN",
      "picName": "Perias Bali",
      "location": "Ruang rias",
      "attire": "Payas Bali",
      "rituals": [
        {
          "name": "Pemasangan Busana",
          "meaning": "Menyiapkan busana dan gelungan sesuai pakem yang dipilih.",
          "equipment": [
            "Payas",
            "Aksesori"
          ]
        }
      ],
      "notes": "Estimasi operasional; cocokkan dengan pemandu adat, keluarga, dan pemuka agama.",
      "timeStart": "06:00",
      "timeEnd": "07:30",
      "sortOrder": 1
    },
    {
      "title": "Penyambutan & Persiapan Upacara",
      "ceremonyType": "PENYAMBUTAN",
      "picName": "Koordinator keluarga & pemangku",
      "location": "Rumah / area upacara",
      "attire": "Busana adat Bali",
      "rituals": [
        {
          "name": "Penataan Sarana Upakara",
          "meaning": "Memeriksa banten dan lokasi yang telah disucikan.",
          "equipment": [
            "Banten",
            "Tikar"
          ]
        }
      ],
      "notes": "Estimasi operasional; cocokkan dengan pemandu adat, keluarga, dan pemuka agama.",
      "timeStart": "08:00",
      "timeEnd": "08:45",
      "sortOrder": 2
    },
    {
      "title": "Upacara Mekala-kalaan / Mabyakala",
      "ceremonyType": "UPACARA_ADAT",
      "picName": "Pemangku / sulinggih",
      "location": "Area upacara",
      "attire": "Busana upacara",
      "rituals": [
        {
          "name": "Mekala-kalaan",
          "meaning": "Ritual Hindu Bali menggunakan sarana simbolik menurut arahan pemangku.",
          "equipment": [
            "Sanggah Surya",
            "Tikeh dadakan",
            "Benang putih",
            "Tegen-tegenan"
          ]
        }
      ],
      "notes": "Susunan ritual dan penamaan bergantung desa adat serta pemuka agama.",
      "timeStart": "09:00",
      "timeEnd": "10:00",
      "sortOrder": 3
    },
    {
      "title": "Natab Banten dan Doa Keluarga",
      "ceremonyType": "UPACARA_ADAT",
      "picName": "Pemangku & keluarga",
      "location": "Area persembahyangan",
      "attire": "Busana Bali",
      "rituals": [
        {
          "name": "Doa dan Pesaksian",
          "meaning": "Kesaksian spiritual dan restu bagi pasangan sesuai tata upacara Hindu Bali.",
          "equipment": [
            "Banten sesuai pemangku",
            "Tirta"
          ]
        }
      ],
      "notes": "Estimasi operasional; cocokkan dengan pemandu adat, keluarga, dan pemuka agama.",
      "timeStart": "10:15",
      "timeEnd": "11:15",
      "sortOrder": 4
    },
    {
      "title": "Jamuan Keluarga Bali",
      "ceremonyType": "RESEPSI",
      "picName": "WO & keluarga",
      "location": "Area jamuan",
      "attire": "Busana Bali",
      "rituals": [
        {
          "name": "Ramah Tamah",
          "meaning": "Jamuan setelah tahapan suci selesai.",
          "equipment": [
            "Hidangan",
            "Buku tamu"
          ]
        }
      ],
      "notes": "Estimasi operasional; cocokkan dengan pemandu adat, keluarga, dan pemuka agama.",
      "timeStart": "11:30",
      "timeEnd": "13:30",
      "sortOrder": 5
    }
  ],
  BANJAR: [
    {
      "title": "Rias Pengantin Banjar",
      "ceremonyType": "PERSIAPAN",
      "picName": "MUA Banjar",
      "location": "Ruang rias",
      "attire": "Busana Banjar",
      "rituals": [
        {
          "name": "Pemasangan Aksesori Banjar",
          "meaning": "Rias dan penataan busana sesuai pilihan keluarga.",
          "equipment": [
            "Busana",
            "Aksesori"
          ]
        }
      ],
      "notes": "Estimasi operasional; cocokkan dengan pemandu adat, keluarga, dan pemuka agama.",
      "timeStart": "06:00",
      "timeEnd": "07:30",
      "sortOrder": 1
    },
    {
      "title": "Maarak / Penyambutan Pengantin",
      "ceremonyType": "PENYAMBUTAN",
      "picName": "MC & koordinator keluarga",
      "location": "Gerbang venue",
      "attire": "Busana Banjar",
      "rituals": [
        {
          "name": "Maarak Pengantin",
          "meaning": "Mengantar pasangan dengan rombongan keluarga.",
          "equipment": [
            "Musik",
            "Hantaran"
          ]
        }
      ],
      "notes": "Estimasi operasional; cocokkan dengan pemandu adat, keluarga, dan pemuka agama.",
      "timeStart": "08:00",
      "timeEnd": "08:45",
      "sortOrder": 2
    },
    {
      "title": "Akad Nikah",
      "ceremonyType": "AKAD",
      "picName": "Penghulu dan wali",
      "location": "Area akad",
      "attire": "Busana nikah",
      "rituals": [
        {
          "name": "Ijab Kabul",
          "meaning": "Pengesahan pernikahan menurut agama dan negara.",
          "equipment": [
            "Mahar",
            "Berkas KUA"
          ]
        }
      ],
      "notes": "Estimasi operasional; cocokkan dengan pemandu adat, keluarga, dan pemuka agama.",
      "timeStart": "09:00",
      "timeEnd": "10:00",
      "sortOrder": 3
    },
    {
      "title": "Batatai dan Restu Keluarga",
      "ceremonyType": "UPACARA_ADAT",
      "picName": "Tetua adat & keluarga",
      "location": "Pelaminan",
      "attire": "Busana Banjar",
      "rituals": [
        {
          "name": "Batatai",
          "meaning": "Kedua pengantin bersanding menerima sambutan.",
          "equipment": [
            "Pelaminan"
          ]
        },
        {
          "name": "Restu Keluarga",
          "meaning": "Saling memberi doa dan nasihat.",
          "equipment": [
            "Mikrofon"
          ]
        }
      ],
      "notes": "Estimasi operasional; cocokkan dengan pemandu adat, keluarga, dan pemuka agama.",
      "timeStart": "10:15",
      "timeEnd": "11:15",
      "sortOrder": 4
    },
    {
      "title": "Aruh Perkawinan dan Jamuan",
      "ceremonyType": "RESEPSI",
      "picName": "WO & keluarga",
      "location": "Area pesta",
      "attire": "Busana Banjar",
      "rituals": [
        {
          "name": "Jamuan Perkawinan",
          "meaning": "Menjamu kerabat dan tetangga.",
          "equipment": [
            "Hidangan"
          ]
        }
      ],
      "notes": "Estimasi operasional; cocokkan dengan pemandu adat, keluarga, dan pemuka agama.",
      "timeStart": "11:30",
      "timeEnd": "13:30",
      "sortOrder": 5
    }
  ],
  SASAK: [
    {
      "title": "Rias dan Busana Sasak",
      "ceremonyType": "PERSIAPAN",
      "picName": "MUA Sasak",
      "location": "Ruang rias",
      "attire": "Busana Sasak",
      "rituals": [
        {
          "name": "Pemasangan Busana",
          "meaning": "Menata songket dan aksesori Sasak.",
          "equipment": [
            "Songket",
            "Busana adat"
          ]
        }
      ],
      "notes": "Estimasi operasional; cocokkan dengan pemandu adat, keluarga, dan pemuka agama.",
      "timeStart": "06:00",
      "timeEnd": "07:30",
      "sortOrder": 1
    },
    {
      "title": "Penerimaan Rombongan Keluarga",
      "ceremonyType": "PENYAMBUTAN",
      "picName": "Koordinator keluarga",
      "location": "Pintu venue",
      "attire": "Busana Sasak",
      "rituals": [
        {
          "name": "Penyambutan Keluarga",
          "meaning": "Menerima kerabat sesuai musyawarah kedua pihak.",
          "equipment": [
            "Daftar rombongan"
          ]
        }
      ],
      "notes": "Estimasi operasional; cocokkan dengan pemandu adat, keluarga, dan pemuka agama.",
      "timeStart": "08:00",
      "timeEnd": "08:45",
      "sortOrder": 2
    },
    {
      "title": "Akad Nikah",
      "ceremonyType": "AKAD",
      "picName": "Penghulu & wali",
      "location": "Area akad",
      "attire": "Busana nikah",
      "rituals": [
        {
          "name": "Ijab Kabul",
          "meaning": "Pengesahan perkawinan menurut agama.",
          "equipment": [
            "Mahar",
            "Berkas KUA"
          ]
        }
      ],
      "notes": "Estimasi operasional; cocokkan dengan pemandu adat, keluarga, dan pemuka agama.",
      "timeStart": "09:00",
      "timeEnd": "10:00",
      "sortOrder": 3
    },
    {
      "title": "Sorong Serah Aji Krame",
      "ceremonyType": "UPACARA_ADAT",
      "picName": "Pembayun / pemandu adat",
      "location": "Area adat",
      "attire": "Busana Sasak",
      "rituals": [
        {
          "name": "Sorong Serah",
          "meaning": "Penyampaian dan penerimaan kesepakatan adat kedua keluarga.",
          "equipment": [
            "Perlengkapan aji krame",
            "Naskah adat"
          ]
        }
      ],
      "notes": "Kadang dilakukan pada hari berbeda dari akad.",
      "timeStart": "10:15",
      "timeEnd": "11:15",
      "sortOrder": 4
    },
    {
      "title": "Nyongkolan dan Jamuan",
      "ceremonyType": "RESEPSI",
      "picName": "WO & rombongan adat",
      "location": "Rute arak-arakan",
      "attire": "Busana Sasak",
      "rituals": [
        {
          "name": "Nyongkolan",
          "meaning": "Arak-arakan silaturahmi menuju keluarga mempelai wanita.",
          "equipment": [
            "Musik tradisional",
            "Rute aman"
          ]
        }
      ],
      "notes": "Atur izin rute, keselamatan, dan waktu; nyongkolan dapat di hari lain.",
      "timeStart": "11:30",
      "timeEnd": "13:30",
      "sortOrder": 5
    }
  ],
  DAYAK_NGAJU: [
    {
      "title": "Persiapan Busana Adat Ngaju",
      "ceremonyType": "PERSIAPAN",
      "picName": "Perias adat & keluarga",
      "location": "Ruang rias",
      "attire": "Busana Dayak Ngaju",
      "rituals": [
        {
          "name": "Persiapan Busana",
          "meaning": "Menyiapkan pakaian, aksesori, dan perlengkapan sesuai keputusan tetua.",
          "equipment": [
            "Busana adat"
          ]
        }
      ],
      "notes": "Estimasi operasional; cocokkan dengan pemandu adat, keluarga, dan pemuka agama.",
      "timeStart": "06:00",
      "timeEnd": "07:30",
      "sortOrder": 1
    },
    {
      "title": "Panganten Mandai & Lawang Sakepeng",
      "ceremonyType": "PENYAMBUTAN",
      "picName": "Mantir adat & kelompok penyambut",
      "location": "Gerbang venue",
      "attire": "Busana adat",
      "rituals": [
        {
          "name": "Mambuka Lawang Sakepeng",
          "meaning": "Simbol menyambut rombongan pengantin melalui prosesi pembukaan gerbang.",
          "equipment": [
            "Gerbang simbolis",
            "Peralatan pertunjukan aman"
          ]
        }
      ],
      "notes": "Estimasi operasional; cocokkan dengan pemandu adat, keluarga, dan pemuka agama.",
      "timeStart": "08:00",
      "timeEnd": "08:45",
      "sortOrder": 2
    },
    {
      "title": "Pengesahan Pernikahan Menurut Agama",
      "ceremonyType": "PENGESAHAN",
      "picName": "Pemuka agama",
      "location": "Ruang ibadah / venue",
      "attire": "Busana pernikahan",
      "rituals": [
        {
          "name": "Pengesahan Sesuai Agama",
          "meaning": "Dilakukan sesuai agama pasangan; adat dan administrasi negara diatur terpisah.",
          "equipment": [
            "Dokumen sesuai agama"
          ]
        }
      ],
      "notes": "Estimasi operasional; cocokkan dengan pemandu adat, keluarga, dan pemuka agama.",
      "timeStart": "09:00",
      "timeEnd": "10:00",
      "sortOrder": 3
    },
    {
      "title": "Haluang Hapelek & Manyaki Panganten",
      "ceremonyType": "UPACARA_ADAT",
      "picName": "Mantir / Damang & keluarga",
      "location": "Balai adat",
      "attire": "Busana Dayak Ngaju",
      "rituals": [
        {
          "name": "Haluang Hapelek",
          "meaning": "Dialog adat terkait kesepakatan dan Jalan Hadat.",
          "equipment": [
            "Daftar Jalan Hadat"
          ]
        },
        {
          "name": "Manyaki Panganten (Jika Sesuai)",
          "meaning": "Ritual yang dipimpin petugas adat dengan penghormatan terhadap keyakinan pasangan.",
          "equipment": [
            "Sarana adat dari pemimpin upacara"
          ]
        }
      ],
      "notes": "Prosesi adat sakral tidak boleh diasumsikan wajib bagi semua keluarga Ngaju.",
      "timeStart": "10:15",
      "timeEnd": "11:15",
      "sortOrder": 4
    },
    {
      "title": "Jamuan dan Silaturahmi Keluarga",
      "ceremonyType": "RESEPSI",
      "picName": "WO & keluarga",
      "location": "Area jamuan",
      "attire": "Busana adat",
      "rituals": [
        {
          "name": "Jamuan Keluarga",
          "meaning": "Perkenalan dan doa bersama antarkeluarga.",
          "equipment": [
            "Hidangan"
          ]
        }
      ],
      "notes": "Estimasi operasional; cocokkan dengan pemandu adat, keluarga, dan pemuka agama.",
      "timeStart": "11:30",
      "timeEnd": "13:30",
      "sortOrder": 5
    }
  ],
};
