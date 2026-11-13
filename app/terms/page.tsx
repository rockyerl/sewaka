import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { BrandSymbol } from "@/components/ui/brand-logo";

export const metadata = {
  title: "Syarat & Ketentuan Layanan | Sewaka",
  description: "Syarat dan ketentuan penggunaan platform perencanaan pernikahan Sewaka.",
};

export default function TermsPage() {
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
            Syarat & Ketentuan Layanan
          </h1>
          <p className="mx-auto mt-2 max-w-lg text-xs text-muted-foreground">
            Terakhir diperbarui: 13 November 2026
          </p>
        </div>

        <Card className="rounded-2xl border border-[#5B132B]/10 bg-white/80 p-6 sm:p-10 shadow-xs space-y-8 text-sm leading-relaxed text-[#1C1917]/80">
          <section>
            <h2 className="text-base font-semibold text-[#5B132B] mb-2">1. Ketentuan Umum</h2>
            <p>
              Selamat datang di Sewaka (selanjutnya disebut &ldquo;Platform&rdquo; atau &ldquo;Kami&rdquo;). Dengan mendaftar, mengakses, atau menggunakan layanan Sewaka, Anda menyatakan bahwa Anda telah membaca, memahami, dan menyetujui untuk terikat dengan Syarat dan Ketentuan ini. Jika Anda tidak menyetujui sebagian atau seluruh ketentuan ini, Anda dipersilakan untuk tidak menggunakan layanan Kami.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#5B132B] mb-2">2. Akun & Keamanan</h2>
            <p>
              Untuk menggunakan fitur penuh Sewaka, Anda wajib membuat akun dengan menyediakan data yang benar, lengkap, dan terkini. Anda bertanggung jawab penuh atas kerahasiaan kata sandi dan seluruh aktivitas yang terjadi di bawah akun Anda. Segera hubungi tim Kami jika Anda mencurigai adanya akses tanpa izin terhadap akun Anda.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#5B132B] mb-2">3. Layanan & Paket Langganan</h2>
            <p>
              Sewaka menyediakan platform perencanaan pernikahan berbasis web, mencakup pengelolaan anggaran, daftar tamu, rundown acara adat, seserahan, serta koordinasi vendor. Kami menyediakan paket Gratis dan paket Premium berbayar.
            </p>
            <ul className="mt-2 list-disc list-inside space-y-1 text-xs">
              <li>Paket berbayar diproses secara aman melalui payment gateway resmi rekanan kami (Midtrans).</li>
              <li>Biaya langganan dibayarkan di muka dan mencakup fitur-fitur yang tertera pada halaman rincian paket.</li>
              <li>Kami berhak melakukan penyesuaian harga atau fitur paket dengan pemberitahuan wajar sebelumnya.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#5B132B] mb-2">4. Kebijakan Pengembalian Dana (Refund Policy)</h2>
            <p>
              Kepuasan Anda adalah prioritas kami. Kami memberikan garansi pengembalian dana penuh (100% refund) dalam waktu <strong>7 (tujuh) hari kalender</strong> sejak tanggal transaksi pertama kali dilakukan, apabila layanan tidak berfungsi sebagaimana mestinya atau tidak memenuhi kebutuhan perencanaan pernikahan Anda. Untuk mengajukan pengembalian dana, silakan hubungi <a href="mailto:support@sewaka.com" className="text-[#5B132B] underline font-medium">support@sewaka.com</a> dengan menyertakan bukti pembayaran dan nomor pesanan.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#5B132B] mb-2">5. Konten & Data Pengguna</h2>
            <p>
              Seluruh data yang Anda masukkan ke dalam platform (seperti nama tamu, rincian anggaran pernikahan, foto, dan catatan pribadi) tetap merupakan hak milik Anda sepenuhnya. Sewaka tidak akan membagikan, menyewakan, atau menjual data pribadi Anda maupun data tamu Anda kepada pihak ketiga manapun untuk tujuan periklanan atau pemasaran.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#5B132B] mb-2">6. Batasan Tanggung Jawab</h2>
            <p>
              Sewaka beroperasi sebagai alat bantu perencanaan dan manajemen pernikahan. Kami tidak bertindak sebagai wedding organizer lapangan resmi, dan tidak bertanggung jawab langsung atas perselisihan antara Anda dengan vendor pihak ketiga yang Anda kelola melalui platform.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#5B132B] mb-2">7. Hubungi Kami</h2>
            <p>
              Apabila Anda memiliki pertanyaan, keluhan, atau memerlukan bantuan teknis terkait Syarat & Ketentuan ini, silakan hubungi tim kami melalui:
            </p>
            <p className="mt-2 text-xs">
              <strong>Email:</strong> <a href="mailto:hello@sewaka.com" className="text-[#5B132B] underline">hello@sewaka.com</a> / <a href="mailto:support@sewaka.com" className="text-[#5B132B] underline">support@sewaka.com</a><br />
              <strong>WhatsApp Support:</strong> +62 812-3456-7890<br />
              <strong>Lokasi:</strong> Jakarta, Indonesia
            </p>
          </section>
        </Card>
      </main>
    </div>
  );
}
