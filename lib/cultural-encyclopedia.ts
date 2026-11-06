import { CulturalTradition } from "./cultural-templates";

export interface UbarampeItem {
  name: string;
  meaning: string;
}

export interface RitualArticle {
  id: string;
  tradition: CulturalTradition;
  title: string;
  subtitle: string;
  category: "PERSIAPAN" | "AKAD" | "UPACARA_ADAT" | "RESEPSI";
  philosophy: string;
  stepByStep: string[];
  ubarampe: UbarampeItem[];
  culturalAdvice: string;
}

export const CULTURAL_ENCYCLOPEDIA: RitualArticle[] = [
  // --- JAWA ---
  {
    id: "jawa-siraman",
    tradition: "JAWA",
    title: "Upacara Siraman & Pecah Pamor",
    subtitle: "Penyucian Raga dan Jiwa Menjelang Ijab Qabul",
    category: "PERSIAPAN",
    philosophy:
      "Siraman bermakna membersihkan diri lahir dan batin bagi kedua calon mempelai sebelum memasuki gerbang suci pernikahan. Dilakukan dengan air dari 7 sumber mata air suci yang ditaburi kembang setaman (mawar, melati, kantil, kenanga), melambangkan harumnya nama baik dan kesucian budi pekerti.",
    stepByStep: [
      "Sungkem nyuwun pangestu kepada ayah dan ibu memohon doa restu suci.",
      "Siraman diawali oleh ayahanda, ibunda, disusul pini sepuh ganjil (7 atau 9 orang).",
      "Kumur air kendi suci 3 kali, membasuh wajah 3 kali, dan menyucikan tubuh.",
      "Pemecahan kendi oleh ayahanda dan ibunda sambil mengucap 'Niat ingsun ora mecah kendi, nanging mecah pamore anakku'.",
      "Gendongan: Ayah menggendong mempelai putri sebagai tanda berakhirnya tanggung jawab nafkah orang tua.",
      "Dodol Dawet: Orang tua berjualan dawet dengan kreweng (genteng) sebagai doa agar rezeki melimpah dan tamu resepsi melimpah ruah.",
    ],
    ubarampe: [
      { name: "Air 7 Sumber Mata Air", meaning: "Pitu melambangkan pitulungan (pertolongan) dari Sang Pencipta" },
      { name: "Kembang Setaman (Mawar, Melati, Kantil)", meaning: "Harumnya budi pekerti dan ketulusan niat berumah tangga" },
      { name: "Cengkir Gading Diberi Rajah", meaning: "Kekuatan tekad dan kesucian keturunan masa depan" },
      { name: "Kendi Tanah Liat", meaning: "Wadah air penyucian raga dan pemecah pamor kecantikan sejati" },
      { name: "Jarik Motif Grompol & Nagasari", meaning: "Berkumpulnya segala kebaikan, rezeki, dan keselamatan" },
      { name: "Kreweng & Payung Dodol Dawet", meaning: "Uang tembikar dan naungan doa rezeki berkah berlimpah" },
    ],
    culturalAdvice:
      "Pastikan suhu air nyaman dan hangat suam-suam kuku dicampur tetesan air mawar agar mempelai tidak kedinginan. Siapkan handuk hangat tebal saat prosesi gendongan.",
  },
  {
    id: "jawa-midodareni",
    tradition: "JAWA",
    title: "Malam Midodareni & Turuning Bidadari",
    subtitle: "Malam Penuh Doa dan Pembekalan Pranikah",
    category: "PERSIAPAN",
    philosophy:
      "Berasal dari kata 'widodari' (bidadari). Dipercaya bahwa pada malam menjelang akad nikah, bidadari surga turun ke bumi menyempurnakan keelokan dan keanggunan mempelai wanita. Mempelai putri dilarang tidur hingga tengah malam dan didampingi keluarga wanita.",
    stepByStep: [
      "Tantingan: Ayahanda menanyakan kemantapan hati mempelai putri untuk diperistri calon mempelai pria.",
      "Kedatangan Rombongan Nyantri: Calon mempelai pria datang ke kediaman wanita membawa seserahan, namun hanya duduk di serambi luar (nyantri).",
      "Serah terima seserahan dan hantaran kembar mayang.",
      "Pembacaan Catur Wedha: Wejangan luhur empat pilar kepemimpinan rumah tangga dari calon mertua kepada mempelai pria.",
      "Malam tirakatan dan doa bersama hingga tengah malam.",
    ],
    ubarampe: [
      { name: "Sepasang Kembar Mayang (Dewandaru & Kalpadaru)", meaning: "Pohon kehidupan suci pembawa kebahagiaan dan keselamatan" },
      { name: "Catur Wedha berbingkai emas", meaning: "Empat pedoman luhur ksatria dalam memimpin bahtera rumah tangga" },
      { name: "Baki Hantaran Buah & Makanan Adat", meaning: "Kelengkapan rezeki dan manisnya kehidupan perkawinan" },
    ],
    culturalAdvice:
      "Suasana malam midodareni hendaknya hening, khusyuk, dan remang diterangi lilin atau lampu temaram beraroma dupa melati agar nuansa sakral terasa sempurna.",
  },
  {
    id: "jawa-panggih",
    tradition: "JAWA",
    title: "Upacara Panggih Ageng Keraton",
    subtitle: "Puncak Penyatuan Agung Dua Mempelai & Dua Dinasti",
    category: "UPACARA_ADAT",
    philosophy:
      "Panggih berarti 'bertemu'. Prosesi sakral bertemunya mempelai pria dan wanita setelah sah sebagai suami istri, sarat akan simbolisme hak dan kewajiban dalam tata krama agung budaya Jawa.",
    stepByStep: [
      "Balangan Gantal: Saling melempar sirih terikat benang putih melambangkan pertalian cinta tulus dari hati ke hati.",
      "Ngidak Endhog & Wijidadi: Mempelai pria menginjak telur ayam kampung lalu dibasuh kakinya oleh mempelai wanita sebagai lambang bakti dan penyucian.",
      "Sinduran: Ayahanda mempelai wanita membimbing kedua pengantin dengan selendang merah putih menuju singgasana pelaminan.",
      "Bobot Timbang: Kedua mempelai duduk di pangkuan ayahanda, lalu sang ayah menyatakan 'Kekalihanipun sami abotipun' (keduanya sama beratnya/sama sayangnya).",
      "Kacar-Kucur (Tampo Koyo): Mempelai pria menuangkan biji-bijian, koin logam, dan beras kuning ke pangkuan istri tanda tanggung jawab nafkah.",
      "Dulangan (Dahar Kembul): Suap-suapan nasi kuning dan lauk pauk melambangkan kerukunan sehidup semati.",
      "Sungkeman: Sujud memohon ampunan dan restu surga kepada kedua pasang orang tua.",
    ],
    ubarampe: [
      { name: "Gantal Daun Sirih Terikat Benang Putih", meaning: "Daun sirih beda rupa tapi satu rasa, lambang hati yang menyatu" },
      { name: "Telur Ayam Kampung, Nampan Kuningan & Air Bunga", meaning: "Pecahnya kesucian raga dan penyucian bakti mulia" },
      { name: "Kain Sindur Merah Putih", meaning: "Darah merah dan mani putih, sumber kehidupan manusia ciptaan Gusti" },
      { name: "Kain Morot Kacar-Kucur Berisi Beras Kuning & Uang Logam", meaning: "Nafkah lahir batin yang harus dijaga cermat oleh sang istri" },
      { name: "Nasi Tumpeng Dahar Kembul", meaning: "Penyatuan rezeki dan kerukunan santap bersama" },
    ],
    culturalAdvice:
      "Pada prosesi sungkeman, mintalah juru foto dan MC membiarkan hening beberapa saat tanpa gangguan agar momen tangis syukur dan doa restu tercurah tulus.",
  },

  // --- SUNDA ---
  {
    id: "sunda-ngeuyeuk-seureuh",
    tradition: "SUNDA",
    title: "Upacara Ngeuyeuk Seureuh",
    subtitle: "Wejangan Sakral dan Perlambang Kerukunan Pasutri",
    category: "PERSIAPAN",
    philosophy:
      "Ngeuyeuk seureuh berasal dari bahasa Sunda yang artinya 'mengatur sirih'. Upacara ini dipimpin oleh Pemaes/Panggeuyeuk untuk memberikan petuah pernikahan secara simbolik melalui perumpamaan benda-benda alam, dipenuhi canda halus dan kehangatan keluarga.",
    stepByStep: [
      "Panggeuyeuk melantunkan kidung doa suci Sunda buhun.",
      "Kedua calon mempelai menumbuk sirih dan mengaduk beras bersama sebagai lambang kerja sama nafkah.",
      "Membelah pinang dan menyatukan benang kanteh putih tanda ikatan yang tidak putus.",
      "Menyalakan pelita tujuh sumbu sebagai penerang bahtera kehidupan.",
      "Kedua orang tua menaburkan beras dan irisan bunga wangi memohon berkah.",
    ],
    ubarampe: [
      { name: "Daun Sirih Segar & Gambir", meaning: "Kesejukan jiwa dan sifat saling melengkapi" },
      { name: "Benang Kanteh Putih", meaning: "Kesucian ikatan batin yang kokoh" },
      { name: "Pelita Minyak Tujuh Sumbu", meaning: "Tujuh jalan terang penerang rumah tangga" },
      { name: "Alu dan Lumpang Kecil", meaning: "Kerja sama dan keselarasan dalam mencari rezeki" },
    ],
    culturalAdvice:
      "Hanya dihadiri oleh keluarga inti dan kerabat dekat agar nasihat dan doa berlangsung intim dan berkesan.",
  },
  {
    id: "sunda-sawer-panganten",
    tradition: "SUNDA",
    title: "Sawer Panganten & Huap Lingkung",
    subtitle: "Petuah Hidup Berbalut Tembang dan Rebutan Berkah",
    category: "UPACARA_ADAT",
    philosophy:
      "Sawer bermakna mencurahkan doa dan petuah hidup lewat tembang syahdu Sunda (Cianjuran/Kacapi Suling) sambil menaburkan koin, beras kuning, dan permen yang disambut suka cita oleh para tamu.",
    stepByStep: [
      "Kedua mempelai duduk di bawah payung agung keemasan.",
      "Juru sawer melantunkan pupuh nasihat rumah tangga yang menyentuh kalbu.",
      "Penaburan sawer: beras kuning, uang koin, kunyit, dan permen manis.",
      "Meuleum Harupat: Membakar tujuh lidi kelapa lalu mematahkannya bersama sebagai lambang meredam amarah.",
      "Nincak Endog: Menginjak telur dan membasuh kaki suami dengan air kendi.",
      "Huap Lingkung & Pabetot Bakakak: Menyuap nasi punclut dan saling menarik ayam panggang utuh (yang mendapat bagian besar membawa berkah nafkah).",
    ],
    ubarampe: [
      { name: "Beras Kuning, Uang Logam & Permen Manis", meaning: "Kemakmuran rezeki, kebahagiaan, dan manisnya rumah tangga" },
      { name: "Tujuh Batang Lidi Harupat", meaning: "Tujuh hawa nafsu dan amarah yang wajib dipatahkan demi kedamaian" },
      { name: "Bakakak Hayam Panggang Utuh", meaning: "Rezeki melimpah yang dinikmati bersama dengan lapang dada" },
    ],
    culturalAdvice:
      "Sediakan wadah khusus atau piring cantik untuk bakakak ayam agar prosesi tarik ayam tidak mengotori busana pengantin berpayet.",
  },

  // --- MINANG ---
  {
    id: "minang-malam-bainai",
    tradition: "MINANG",
    title: "Malam Bainai Anak Daro",
    subtitle: "Malam Terakhir Masa Lajang Berhias Inai Merah Sakral",
    category: "PERSIAPAN",
    philosophy:
      "Malam Bainai adalah malam pelekatan tumbukan daun inai merah (pacar) ke ujung kuku-kuku tangan dan kaki calon Anak Daro. Inai merah melambangkan tanda suci bahwa wanita Minang tersebut telah terikat janji dan siap menjadi ratu rumah tangga.",
    stepByStep: [
      "Mandi Suci Bunga Tujuh Rupa diiringi lantunan salawat.",
      "Anak Daro melangkah di atas kain jajakan (kain tirai lapis emas) menuju pelaminan kecil.",
      "Pelekatan inai dimulai oleh ibunda tercinta dan dilanjutkan oleh para sesepuh wanita kerabat terdekat.",
      "Sesepuh membisikkan untaian doa dan nasehat adat ke telinga Anak Daro.",
      "Iringan alunan musik Saluang dan Dendang Minang yang syahdu mengiringi keharuan malam.",
    ],
    ubarampe: [
      { name: "Tumbukan Daun Inai Merah Murni", meaning: "Tanda sakral ikatan pernikahan dan penolak bala" },
      { name: "Kain Jajakan Songket Lapis Emas", meaning: "Jalan kemuliaan menuju gerbang pelaminan" },
      { name: "Bunga Tujuh Warna dalam Carano", meaning: "Penyucian raga dan keharuman budi pekerti calon Anak Daro" },
    ],
    culturalAdvice:
      "Biarkan inai menempel semalaman agar rona merah meresap sempurna dan berkilau kontras di hari resepsi saat mengenakan Suntiang.",
  },
  {
    id: "minang-basandiang",
    tradition: "MINANG",
    title: "Basandiang di Pelaminan Istana Basa",
    subtitle: "Kemegahan Tahta Marapulai dan Keagungan Anak Daro",
    category: "UPACARA_ADAT",
    philosophy:
      "Puncak perhelatan agung Minangkabau di mana kedua pengantin bersanding di pelaminan megah bertingkat motif Rumah Gadang. Mempelai wanita mengenakan Suntiang bertingkat emas lambang mahkota ratu nan perkasa dan bersahaja, sementara Marapulai berbusana Deta Saluk dan Salempang pusaka.",
    stepByStep: [
      "Arak-arakan penjemputan Marapulai diiringi dentuman Gandang Tasa dan Talempong Pacik.",
      "Penyambutan dengan Tari Pasambahan dan suguhan Sirih di dalam Carano adat.",
      "Keluarga kedua pihak saling berbalas pantun adat Minangkabau.",
      "Kedua mempelai duduk bersanding (basandiang) di atas Pelaminan Kencana.",
      "Makan Bajamba bersama ninik mamak, alim ulama, dan cerdik pandai.",
    ],
    ubarampe: [
      { name: "Mahkota Suntiang Gadang Bertingkat", meaning: "Beban kemuliaan dan tanggung jawab mulia seorang ibu rumah tangga" },
      { name: "Carano Kuningan Berisi Daun Sirih", meaning: "Penghormatan tertinggi dalam menyambut tamu agung" },
      { name: "Keris Pusaka Marapulai Terselip di Pinggang", meaning: "Kewibawaan dan kesiapan melindungi keluarga lahir batin" },
      { name: "Dulang Makan Bajamba Bertudung Saji Sulam Emas", meaning: "Demokrasi, kesetaraan, dan musyawarah mufakat kaum adat" },
    ],
    culturalAdvice:
      "Pastikan pemaes memeriksa bantalan busa pada sanggul Suntiang agar tekanan berat di kepala terbagi merata dan nyaman selama prosesi pelaminan.",
  },

  // --- NASIONAL ---
  {
    id: "nasional-persiapan-pelaminan",
    tradition: "NASIONAL",
    title: "Persiapan Pelaminan & Dekorasi Nusantara",
    subtitle: "Menciptakan Ruang Sakral dengan Sentuhan Modern",
    category: "PERSIAPAN",
    philosophy:
      "Pernikahan nasional modern menggabungkan elemen-elemen terbaik dari berbagai tradisi Nusantara dengan sentuhan kontemporer. Pelaminan menjadi pusat perhatian yang mencerminkan kepribadian kedua mempelai, memadukan keindahan alam Indonesia dengan estetika modern yang elegan.",
    stepByStep: [
      "Tentukan tema pernikahan yang merepresentasikan kedua mempelai (rustic, garden, classic, modern, dll).",
      "Pilih venue dan sesuaikan dengan konsep dekorasi yang diinginkan.",
      "Siapkan pelaminan dengan dekorasi bunga segar, kain brokat, atau elemen adat pilihan.",
      "Tata pencahayaan dan musik pengiring untuk menciptakan suasana intim dan berkesan.",
      "Siapkan buku tamu, guest book, atau alternatif kreatif seperti pohon harapan.",
      "Koordinasi dengan vendor fotografi untuk momen-momen penting di pelaminan.",
    ],
    ubarampe: [
      { name: "Dekorasi Pelaminan (Bunga, Kain, Cahaya)", meaning: "Ruang sakral tempat penyatuan dua jiwa dalam ikatan suci" },
      { name: "Busana Pengantin (Kebaya, Jas, atau Adat Pilihan)", meaning: "Ekspresi identitas budaya dan kepribadian kedua mempelai" },
      { name: "Aksesoris Pelengkap (Sanggul, Bros, Jam Tangan)", meaning: "Detail kecil yang menyempurnakan penampilan dan makna" },
      { name: "Buku Tamu & Souvenir", meaning: "Jejak kenangan dan apresiasi atas kehadiran orang-orang tersayang" },
    ],
    culturalAdvice:
      "Pilih elemen dekorasi yang memiliki makna personal bagi kedua mempelai, bukan sekadar tren. Sentuhan personal akan membuat hari pernikahan lebih berkesan dan autentik.",
  },
  {
    id: "nasional-akad-pernikahan",
    tradition: "NASIONAL",
    title: "Akad Nikah & Ijab Qabul",
    subtitle: "Momen Suci Penyatuan Dua Hati di Hadapan Tuhan",
    category: "AKAD",
    philosophy:
      "Akad nikah adalah inti dari pernikahan — momen sakral di mana dua orang menyatakan komitmen suci di hadapan Tuhan dan saksi. Dalam pernikahan nasional, akad tetap menjadi pusat perhatian dengan tata cara yang sesuai agama dan kepercayaan, dibungkus dengan suasana khidmat namun modern.",
    stepByStep: [
      "Persiapan dokumen dan administrasi pernikahan (buku nikah, surat keterangan, dll).",
      "Kedatangan kedua mempelai dan keluarga ke tempat akad.",
      "Pembacaan niat nikah dan khutbah nikah oleh penghulu atau pemuka agama.",
      "Ijab Qabul: Lailazim dan Qabul — momen penentuan sah atau tidaknya pernikahan.",
      "Doa bersama dan penyerahan mempelai wanita kepada mempelai pria.",
      "Pemotongan tumpeng atau kue pernikahan sebagai simbol pertama kerja sama.",
    ],
    ubarampe: [
      { name: "Buku Nikah & Dokumen Resmi", meaning: "Legalitas pernikahan yang diakui negara dan agama" },
      { name: "Cincin Nikah", meaning: "Lambang ikatan abadi yang tidak putus antara suami dan istri" },
      { name: "Mata Air Suci / Air Zamzam", meaning: "Penyucian hati dan keberkahan dalam memulai kehidupan baru" },
      { name: "Tumpeng atau Kue Pernikahan", meaning: "Simbol pertama berbagi rezeki dan kehidupan bersama" },
      { name: "Saksi Pernikahan (Minimal 2 Orang)", meaning: "Peneguhan komitmen di hadapan orang-orang yang dipercaya" },
    ],
    culturalAdvice:
      "Jaga kekhusyukan momen akad. Batasi dokumentasi fotografi agar tidak mengganggu konsentrasi dan kesakralan ijab qabul. Biarkan momen ini menjadi kenangan paling berkesan.",
  },
  {
    id: "nasional-resepsi-pernikahan",
    tradition: "NASIONAL",
    title: "Resepsi & Pesta Pernikahan Modern",
    subtitle: "Perayaan Bahagia Bersama Orang-orang Tersayang",
    category: "RESEPSI",
    philosophy:
      "Resepsi pernikahan nasional adalah perayaan kebahagiaan yang menggabungkan tradisi dan modernitas. Dari first dance hingga throwing petals, setiap momen dirancang untuk menciptakan kenangan indah yang akan dikenang seumur hidup oleh kedua mempelai dan para tamu.",
    stepByStep: [
      "Grand entrance: Masuknya kedua mempelai diiringi musik dan hamparan kelopak bunga.",
      "Reading vows: Pembacaan janji pernikahan yang ditulis langsung oleh kedua mempelai.",
      "First dance: Tarian pertama sebagai suami istri di hadapan orang-orang tersayang.",
      "Cutting cake: Memotong kue pernikahan bersama sebagai simbol kerja sama dalam kehidupan.",
      "Serving dinner: Sajian makan bersama dengan menu yang disesuaikan selera tamu.",
      "Entertainment: Musik live, DJ, atau pertunjukan yang menghidupkan suasana pesta.",
      "Throwing petals/rice: Tamu memberikan berkah dan doa saat kedua mempelai keluar.",
    ],
    ubarampe: [
      { name: "Kue Pernikahan Bertingkat", meaning: "Simbol kebahagiaan dan manisnya kehidupan yang akan dibangun bersama" },
      { name: "Topi Pengantin (Bridal Bouquet & Groom's Boutonniere)", meaning: "Aksesoris sakral yang menandai hari paling istimewa dalam hidup" },
      { name: "Kelopak Bunga untuk Throwing", meaning: "Berkah, doa, dan harapan baik dari para tamu" },
      { name: "Sound System & Pencahayaan", meaning: "Menciptakan suasana meriah dan berkesan bagi semua tamu" },
      { name: "Guest Book & Wish Box", meaning: "Kumpulan doa, harapan, dan pesan cinta dari orang-orang tersayang" },
    ],
    culturalAdvice:
      "Jangan terlalu terpaku pada kesempurnaan. Biarkan ada ruang untuk momen spontan dan kekeluargaan. Pernikahan yang paling berkesan adalah yang terasa autentik dan penuh cinta.",
  },
];
