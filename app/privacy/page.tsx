import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { BrandSymbol } from "@/components/ui/brand-logo";

export const metadata = {
  title: "Kebijakan Privasi | Sewaka",
  description: "Kebijakan privasi dan perlindungan data pribadi pengguna Sewaka.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-svh bg-[#FDFBF7] text-[#1C1917]">
      <main className="mx-auto max-w-[800px] px-4 py-10 sm:px-8 sm:py-16">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>

        {/* Header */}
        <div className="mb-10 text-center">
          <BrandSymbol className="mx-auto" size={48} />
          <h1 className="mt-4 font-serif text-3xl font-normal tracking-tight sm:text-4xl text-[#5B132B]">
            Kebijakan Privasi
          </h1>
          <p className="mx-auto mt-2 max-w-lg text-xs text-muted-foreground">
            Terakhir diperbarui: 13 November 2026
          </p>
        </div>

        <Card className="rounded-2xl border border-[#5B132B]/10 bg-white/80 p-6 sm:p-10 shadow-xs space-y-8 text-sm leading-relaxed text-[#1C1917]/80">
          <section>
            <h2 className="text-base font-semibold text-[#5B132B] mb-2">1. Komitmen Privasi Kami</h2>
            <p>
              Sewaka sangat menghargai privasi Anda dan keluarga besar Anda. Kami berkomitmen untuk melindungi informasi pribadi yang Anda percayakan kepada kami saat merencanakan momen istimewa pernikahan Anda. Kebijakan ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi data Anda sesuai dengan ketentuan perundang-undangan perlindungan data pribadi di Indonesia.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#5B132B] mb-2">2. Informasi yang Kami Kumpulkan</h2>
            <p>Untuk menyelenggarakan platform perencanaan pernikahan yang lancar, kami mengumpulkan data berupa:</p>
            <ul className="mt-2 list-disc list-inside space-y-1 text-xs">
              <li><strong>Informasi Akun:</strong> Nama, alamat email, nomor telepon/WhatsApp, dan kata sandi yang terenkripsi.</li>
              <li><strong>Data Acara & Pasangan:</strong> Nama calon mempelai, tanggal pernikahan, lokasi venue, serta pilihan tradisi adat.</li>
              <li><strong>Data Tamu Undangan:</strong> Nama tamu, nomor kontak, kategori keluarga/relasi, status RSVP, dan catatan kehadiran.</li>
              <li><strong>Data Transaksi:</strong> Riwayat pembayaran paket langganan. Kami tidak menyimpan nomor kartu kredit atau detail perbankan Anda; transaksi diproses langsung oleh payment gateway Midtrans yang tersertifikasi PCI-DSS.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#5B132B] mb-2">3. Penggunaan Informasi</h2>
            <p>Data Anda hanya digunakan untuk tujuan:</p>
            <ul className="mt-2 list-disc list-inside space-y-1 text-xs">
              <li>Menyediakan layanan dashboard, kalkulasi anggaran, dan generator rundown adat.</li>
              <li>Memungkinkan pengiriman pesan konfirmasi RSVP dan kartu undangan digital kepada tamu Anda.</li>
              <li>Mengirimkan notifikasi operasional terkait akun Anda atau pengingat jadwal pernikahan.</li>
              <li>Meningkatkan kualitas fitur, keamanan aplikasi, dan keandalan sistem.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#5B132B] mb-2">4. Keamanan & Penyimpanan Data</h2>
            <p>
              Kami menerapkan standar keamanan teknis dan organisasi yang ketat, termasuk enkripsi saat transmisi data (SSL/TLS), enkripsi saat penyimpanan, dan pembatasan hak akses berbasis peran (Row-Level Security) untuk memastikan tidak ada pengguna lain yang dapat melihat data pernikahan Anda.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#5B132B] mb-2">5. Hak Anda atas Data</h2>
            <p>
              Anda memiliki hak penuh untuk mengakses, memperbarui, mengekspor salinan data, atau meminta penghapusan permanen akun dan seluruh data pernikahan Anda dari server kami kapan saja melalui menu Pengaturan Akun atau menghubungi tim dukungan kami.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#5B132B] mb-2">6. Pertanyaan Privasi</h2>
            <p>
              Jika Anda memiliki pertanyaan mengenai kebijakan privasi ini atau penanganan data pribadi Anda, silakan hubungi Tim Perlindungan Data kami melalui email <a href="mailto:privacy@sewaka.com" className="text-[#5B132B] underline font-medium">privacy@sewaka.com</a>.
            </p>
          </section>
        </Card>
      </main>
    </div>
  );
}
