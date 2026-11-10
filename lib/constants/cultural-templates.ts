import type { CulturalTradition } from "./rundown-templates";
import { RUNDOWN_TEMPLATES, type RundownTemplateItem, type RitualStep } from "./rundown-templates";
import { CHECKLIST_TEMPLATES, type ChecklistTemplateItem } from "./checklist-templates";

export type { CulturalTradition, RundownTemplateItem, RitualStep, ChecklistTemplateItem };
export { RUNDOWN_TEMPLATES, CHECKLIST_TEMPLATES };

export interface CulturalTraditionInfo {
  id: CulturalTradition;
  name: string;
  region: string;
  tagline: string;
  philosophy: string;
  primaryAttire: string;
  colorScheme: {
    hero: string;
    accent: string;
  };
  rundownTemplate: RundownTemplateItem[];
  checklistTemplate: ChecklistTemplateItem[];
}

const TRADITION_INFO: Record<
  CulturalTradition,
  Omit<CulturalTraditionInfo, "rundownTemplate" | "checklistTemplate">
> = {
  JAWA: {
    id: "JAWA",
    name: "Adat Jawa (Paes Ageng / Solo Putri)",
    region: "Yogyakarta & Surakarta",
    tagline: "Keagungan Kraton, Kesucian Cinta Sejati",
    philosophy:
      "Simbolisme luhur penyatuan dua jiwa dan keluarga besar, memohon restu leluhur (sungkeman), perlambang kesuburan, serta tanggung jawab nafkah lahir batin (kacar-kucur).",
    primaryAttire: "Kebaya Bludru Hitam Sulam Emas / Dodot Ageng & Beskap Landhung",
    colorScheme: {
      hero: "#5B132B",
      accent: "#D4AF37",
    },
  },
  SUNDA: {
    id: "SUNDA",
    name: "Adat Sunda (Sunda Siger)",
    region: "Jawa Barat & Banten",
    tagline: "Kagungan Siger, Kasuci Karaton Galuh",
    philosophy:
      "Filosofi Silih Asih, Silih Asah, Silih Asuh. Mahkota Siger melambangkan kehormatan, kearifan, dan keanggunan seorang ratu sehari.",
    primaryAttire: "Kebaya Sunda Modern berpadu Mahkota Siger Kencana & Kembang Goyang",
    colorScheme: {
      hero: "#5B132B",
      accent: "#D4AF37",
    },
  },
  MINANG: {
    id: "MINANG",
    name: "Adat Minangkabau (Suntiang Gadang)",
    region: "Sumatera Barat",
    tagline: "Megah Baralek Gadang, Nagari Nan Indah",
    philosophy:
      "Adat Basandi Syarak, Syarak Basandi Kitabullah. Mahkota Suntiang yang tinggi melambangkan beratnya tanggung jawab seorang istri yang dipikul dengan kebanggaan dan kehormatan.",
    primaryAttire: "Baju Kurung Batabue Beludru Merah Marun & Suntiang Emas 9-11 Tingkat",
    colorScheme: {
      hero: "#5B132B",
      accent: "#D4AF37",
    },
  },
  NASIONAL: {
    id: "NASIONAL",
    name: "Modern Nusantara / Nasional",
    region: "Nusantara Universal",
    tagline: "Harmoni Tradisi & Elegansi Modern",
    philosophy:
      "Perpaduan anggun antara kehangatan budaya Nusantara dengan sentuhan kepraktisan modern kontemporer.",
    primaryAttire: "Kebaya Modern Modifikasi & Jas Formal Dasi Senada",
    colorScheme: {
      hero: "#5B132B",
      accent: "#D4AF37",
    },
  },

  // --- Katalog adat tambahan ---
  BETAWI: {
    "name": "Adat Betawi (Palang Pintu)",
    "region": "DKI Jakarta dan sekitarnya",
    "tagline": "Pantun, Silat, dan Restu Keluarga",
    "philosophy": "Palang Pintu memadukan pantun, seni bela diri, dan doa sebagai ungkapan penghormatan dan kesiapan berumah tangga.",
    "id": "BETAWI",
    "primaryAttire": "Kebaya Encim / Kebaya Pengantin Betawi dan Dandanan Care Haji",
    "colorScheme": {
      "hero": "#266149",
      "accent": "#D9B36B"
    }
  },
  BATAK_TOBA: {
    "name": "Adat Batak Toba",
    "region": "Sumatera Utara (Toba dan sekitarnya)",
    "tagline": "Ulos, Gondang, dan Persatuan Marga",
    "philosophy": "Pernikahan mengikat kedua keluarga besar dalam tata hubungan Dalihan Na Tolu; ulos menjadi lambang kehangatan, berkat, dan ikatan kekerabatan.",
    "id": "BATAK_TOBA",
    "primaryAttire": "Busana Batak Toba dengan Ulos dan aksesori tradisional",
    "colorScheme": {
      "hero": "#872F32",
      "accent": "#E2B565"
    }
  },
  MANDAILING: {
    "name": "Adat Mandailing (Horja)",
    "region": "Mandailing Natal, Sumatera Utara",
    "tagline": "Markobar, Gondang, dan Mangupa",
    "philosophy": "Musyawarah keluarga, tatanan Dalihan Na Tolu, dan petuah Mangupa menjadi landasan kesejahteraan serta tanggung jawab keluarga baru.",
    "id": "MANDAILING",
    "primaryAttire": "Busana adat Mandailing dengan Bulang dan Ampu",
    "colorScheme": {
      "hero": "#3E603A",
      "accent": "#D1AD52"
    }
  },
  ACEH: {
    "name": "Adat Aceh (Peusijuek)",
    "region": "Aceh",
    "tagline": "Doa, Seulanga, dan Restu Keluarga",
    "philosophy": "Peusijuek adalah ungkapan syukur dan harapan keselamatan; tata cara perkawinan Aceh ditentukan oleh keluarga dan tradisi setempat.",
    "id": "ACEH",
    "primaryAttire": "Dara Baro dan Linto Baro dengan busana adat Aceh",
    "colorScheme": {
      "hero": "#47694D",
      "accent": "#D1BA82"
    }
  },
  MELAYU_RIAU: {
    "name": "Adat Melayu Riau",
    "region": "Riau dan Kepulauan Riau (variasi Melayu)",
    "tagline": "Tepuk Tepung Tawar dan Berbalas Pantun",
    "philosophy": "Adab, musyawarah, dan doa keluarga diwujudkan melalui merisik, meminang, berinai, bersanding, serta tepuk tepung tawar.",
    "id": "MELAYU_RIAU",
    "primaryAttire": "Baju Kurung / Kebaya Labuh dan Teluk Belanga / Cekak Musang",
    "colorScheme": {
      "hero": "#14705F",
      "accent": "#DBB96C"
    }
  },
  PALEMBANG: {
    "name": "Adat Palembang (Aesan Gede)",
    "region": "Sumatera Selatan, Palembang",
    "tagline": "Songket dan Keagungan Munggah",
    "philosophy": "Musyawarah kedua keluarga dan puncak prosesi munggah melambangkan penghormatan serta penerimaan mempelai.",
    "id": "PALEMBANG",
    "primaryAttire": "Aesan Gede atau Aesan Paksangko dengan songket",
    "colorScheme": {
      "hero": "#722C4B",
      "accent": "#D7A942"
    }
  },
  LAMPUNG_PEPADUN: {
    "name": "Adat Lampung Pepadun",
    "region": "Lampung (komunitas Pepadun)",
    "tagline": "Siger, Musyawarah, dan Cangget",
    "philosophy": "Begawi dan cakak Pepadun pada keluarga yang menjalankannya berhubungan dengan pengukuhan status adat; tidak berlaku sama untuk seluruh masyarakat Lampung.",
    "id": "LAMPUNG_PEPADUN",
    "primaryAttire": "Siger Lampung, kain tapis, dan busana adat Pepadun",
    "colorScheme": {
      "hero": "#763C28",
      "accent": "#D4B657"
    }
  },
  BUGIS: {
    "name": "Adat Bugis (Mappacci)",
    "region": "Sulawesi Selatan (beragam wilayah Bugis)",
    "tagline": "Mappacci dan Kehormatan Keluarga",
    "philosophy": "Musyawarah mappettu ada dan mappacci mengedepankan kesepakatan keluarga, kebersihan niat, serta doa sebelum memasuki perkawinan.",
    "id": "BUGIS",
    "primaryAttire": "Baju Bodo, lipa sabbe, jas tutup dan songkok Bugis",
    "colorScheme": {
      "hero": "#7B3F3A",
      "accent": "#D9B560"
    }
  },
  BALI: {
    "name": "Adat Bali Hindu (Mekala-kalaan)",
    "region": "Bali (variasi desa adat)",
    "tagline": "Sekala-Niskala dalam Ikatan Wiwaha",
    "philosophy": "Mekala-kalaan dalam perkawinan Hindu Bali memaknai penyucian dan peralihan tanggung jawab rumah tangga; pelaksanaan harus dibimbing pemangku/sulinggih.",
    "id": "BALI",
    "primaryAttire": "Payas Agung / Madya Bali sesuai keluarga",
    "colorScheme": {
      "hero": "#6B4734",
      "accent": "#E2C477"
    }
  },
  BANJAR: {
    "name": "Adat Banjar (Bapapai / Badudus)",
    "region": "Kalimantan Selatan",
    "tagline": "Jujuran, Mandi Adat, dan Batatai",
    "philosophy": "Musyawarah jujuran, perawatan calon pengantin, dan batatai menggarisbawahi tanggung jawab serta kebersamaan dua keluarga.",
    "id": "BANJAR",
    "primaryAttire": "Busana adat Banjar (Bagajah Gamuling / Baamar Galung sesuai pilihan)",
    "colorScheme": {
      "hero": "#6A7A3A",
      "accent": "#D9BD67"
    }
  },
  SASAK: {
    "name": "Adat Sasak (Sorong Serah & Nyongkolan)",
    "region": "Lombok, Nusa Tenggara Barat",
    "tagline": "Aji Krame dan Silaturahmi Nyongkolan",
    "philosophy": "Sorong serah menyatakan kesepakatan dan penghormatan adat, sedangkan nyongkolan memperkenalkan pasangan kepada masyarakat dan keluarga.",
    "id": "SASAK",
    "primaryAttire": "Busana Sasak dengan Lambung / Pegon dan kain songket",
    "colorScheme": {
      "hero": "#335F63",
      "accent": "#D7B978"
    }
  },
  DAYAK_NGAJU: {
    "name": "Adat Dayak Ngaju",
    "region": "Kalimantan Tengah (komunitas Ngaju)",
    "tagline": "Jalan Hadat dan Penghormatan Keluarga",
    "philosophy": "Pelek Rujin Pangawin dan Jalan Hadat memuat komitmen, hak, serta tanggung jawab kedua pihak dalam tata adat Dayak Ngaju.",
    "id": "DAYAK_NGAJU",
    "primaryAttire": "Busana adat Dayak Ngaju sesuai keluarga dan komunitas",
    "colorScheme": {
      "hero": "#693E35",
      "accent": "#D0AD71"
    }
  },
};

// Combine tradition info with templates for backward compatibility
export const CULTURAL_TRADITIONS: Record<CulturalTradition, CulturalTraditionInfo> = {
  JAWA: {
    ...TRADITION_INFO.JAWA,
    rundownTemplate: RUNDOWN_TEMPLATES.JAWA,
    checklistTemplate: CHECKLIST_TEMPLATES.JAWA,
  },
  SUNDA: {
    ...TRADITION_INFO.SUNDA,
    rundownTemplate: RUNDOWN_TEMPLATES.SUNDA,
    checklistTemplate: CHECKLIST_TEMPLATES.SUNDA,
  },
  MINANG: {
    ...TRADITION_INFO.MINANG,
    rundownTemplate: RUNDOWN_TEMPLATES.MINANG,
    checklistTemplate: CHECKLIST_TEMPLATES.MINANG,
  },
  NASIONAL: {
    ...TRADITION_INFO.NASIONAL,
    rundownTemplate: RUNDOWN_TEMPLATES.NASIONAL,
    checklistTemplate: CHECKLIST_TEMPLATES.NASIONAL,
  },

  // Tradisi baru memanfaatkan struktur yang sama.
  BETAWI: { ...TRADITION_INFO.BETAWI, rundownTemplate: RUNDOWN_TEMPLATES.BETAWI, checklistTemplate: CHECKLIST_TEMPLATES.BETAWI },
  BATAK_TOBA: { ...TRADITION_INFO.BATAK_TOBA, rundownTemplate: RUNDOWN_TEMPLATES.BATAK_TOBA, checklistTemplate: CHECKLIST_TEMPLATES.BATAK_TOBA },
  MANDAILING: { ...TRADITION_INFO.MANDAILING, rundownTemplate: RUNDOWN_TEMPLATES.MANDAILING, checklistTemplate: CHECKLIST_TEMPLATES.MANDAILING },
  ACEH: { ...TRADITION_INFO.ACEH, rundownTemplate: RUNDOWN_TEMPLATES.ACEH, checklistTemplate: CHECKLIST_TEMPLATES.ACEH },
  MELAYU_RIAU: { ...TRADITION_INFO.MELAYU_RIAU, rundownTemplate: RUNDOWN_TEMPLATES.MELAYU_RIAU, checklistTemplate: CHECKLIST_TEMPLATES.MELAYU_RIAU },
  PALEMBANG: { ...TRADITION_INFO.PALEMBANG, rundownTemplate: RUNDOWN_TEMPLATES.PALEMBANG, checklistTemplate: CHECKLIST_TEMPLATES.PALEMBANG },
  LAMPUNG_PEPADUN: { ...TRADITION_INFO.LAMPUNG_PEPADUN, rundownTemplate: RUNDOWN_TEMPLATES.LAMPUNG_PEPADUN, checklistTemplate: CHECKLIST_TEMPLATES.LAMPUNG_PEPADUN },
  BUGIS: { ...TRADITION_INFO.BUGIS, rundownTemplate: RUNDOWN_TEMPLATES.BUGIS, checklistTemplate: CHECKLIST_TEMPLATES.BUGIS },
  BALI: { ...TRADITION_INFO.BALI, rundownTemplate: RUNDOWN_TEMPLATES.BALI, checklistTemplate: CHECKLIST_TEMPLATES.BALI },
  BANJAR: { ...TRADITION_INFO.BANJAR, rundownTemplate: RUNDOWN_TEMPLATES.BANJAR, checklistTemplate: CHECKLIST_TEMPLATES.BANJAR },
  SASAK: { ...TRADITION_INFO.SASAK, rundownTemplate: RUNDOWN_TEMPLATES.SASAK, checklistTemplate: CHECKLIST_TEMPLATES.SASAK },
  DAYAK_NGAJU: { ...TRADITION_INFO.DAYAK_NGAJU, rundownTemplate: RUNDOWN_TEMPLATES.DAYAK_NGAJU, checklistTemplate: CHECKLIST_TEMPLATES.DAYAK_NGAJU },
};
