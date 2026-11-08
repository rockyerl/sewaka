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
