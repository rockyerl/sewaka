export type CulturalTradition = "JAWA" | "SUNDA" | "MINANG" | "NASIONAL";

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
};
