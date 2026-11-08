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
};
