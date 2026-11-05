---
platforms:
- Web
- Android
- iOS
product_type: SaaS
status: Draft
subtitle: Couple-Centric Wedding Planning SaaS
target_market: Indonesia
title: Wedora --- Product Requirements Document
version: 1.0
---

# Wedora --- Product Requirements Document

**Product tagline:** Your Wedding, Beautifully Organized.\
**Document purpose:** Menjadi acuan product discovery, UI/UX design,
software architecture, development, QA, dan UAT.

> Catatan: Wedora adalah working title. Nama produk, paket harga, dan
> keputusan fitur masih dapat diubah setelah validasi pasar.

## 1. Product Overview

### 1.1 Product Vision

Menjadi platform wedding planning yang membantu pasangan merencanakan,
mengatur, menganggarkan, dan mengelola pernikahan dari awal hingga hari
pelaksanaan secara mudah, transparan, terorganisir, dan sesuai anggaran.

### 1.2 Product Concept

Wedora adalah **Personal Wedding Planning Platform** berbasis SaaS.
Pengguna utamanya adalah pasangan calon pengantin (couple). Pasangan
memiliki wedding workspace pribadi untuk mengelola seluruh kebutuhan
pernikahan dan dapat mengundang partner, keluarga, atau wedding
coordinator dengan hak akses terbatas.

Produk tidak mensyaratkan pengguna memakai WO atau vendor yang terdaftar
di platform. Vendor management pada fase awal berfungsi sebagai database
pribadi pasangan. Marketplace publik merupakan pengembangan lanjutan.

### 1.3 Product Objectives

1.  Menyediakan satu tempat untuk mengelola seluruh persiapan
    pernikahan.
2.  Membantu pasangan merencanakan dan mengontrol anggaran.
3.  Memudahkan pencarian, pencatatan, dan perbandingan vendor.
4.  Mengintegrasikan checklist, kalender, dan timeline persiapan.
5.  Mengelola daftar tamu, undangan, dan konfirmasi kehadiran.
6.  Memfasilitasi kolaborasi pasangan, keluarga, dan koordinator.
7.  Mendukung operasional hari pernikahan melalui rundown dan check-in
    tamu.
8.  Menyediakan model SaaS berlangganan dengan pembatasan fitur
    berdasarkan paket.

### 1.4 Target Users

  -----------------------------------------------------------------------
  Segment                             Description
  ----------------------------------- -----------------------------------
  Engaged Couples                     Pasangan yang sedang mempersiapkan
                                      pernikahan

  Independent Couples                 Pasangan yang mengelola pernikahan
                                      secara mandiri

  Assisted Planning Couples           Pasangan yang menggunakan WO tetapi
                                      ingin memantau persiapan

  Premium Couples                     Pasangan dengan kebutuhan
                                      perencanaan dan koordinasi lebih
                                      kompleks
  -----------------------------------------------------------------------

### 1.5 Product Platforms

  -----------------------------------------------------------------------
  Platform                            Primary Responsibilities
  ----------------------------------- -----------------------------------
  Web Application                     Dashboard, budgeting, vendor, guest
                                      management, reports, workspace
                                      settings

  Mobile Application                  Checklist, reminders, expense
                                      tracking, guest monitoring,
                                      collaboration, push notifications

  Backend API                         Business logic, authentication,
                                      authorization, integrations, data
                                      access

  SaaS Admin Portal                   User, workspace, subscription,
                                      payment, plan, and platform
                                      management

  Guest Web Interface                 Digital invitation, RSVP, and guest
                                      information

  Check-in Interface                  QR scanning and attendance
                                      recording
  -----------------------------------------------------------------------

## 2. Product Principles

1.  **Couple-first:** seluruh pengalaman utama dirancang untuk pasangan.
2.  **Workspace-based:** data pernikahan berada dalam workspace
    terpisah.
3.  **Collaborative:** pasangan dapat bekerja bersama dan mengundang
    pihak lain.
4.  **Budget-aware:** keputusan dan aktivitas dapat dikaitkan dengan
    anggaran.
5.  **Mobile-friendly:** aktivitas penting harus mudah dilakukan melalui
    ponsel.
6.  **Privacy by design:** data pribadi, tamu, dokumen, dan transaksi
    harus dilindungi.
7.  **Incremental delivery:** fitur dikembangkan bertahap berdasarkan
    prioritas dan validasi pasar.

## 3. User Roles & Permissions

### 3.1 Roles

  -----------------------------------------------------------------------
  Role                                Description
  ----------------------------------- -----------------------------------
  Primary Couple                      Pemilik utama wedding workspace

  Partner                             Pasangan yang diundang ke workspace

  Family Member                       Orang tua atau anggota keluarga
                                      dengan akses terbatas

  Wedding Coordinator                 WO atau koordinator yang diberi
                                      akses oleh pasangan

  Guest                               Tamu yang menerima undangan dan
                                      melakukan RSVP

  Platform Admin                      Administrator SaaS
  -----------------------------------------------------------------------

### 3.2 Permission Definitions

  Permission   Meaning
  ------------ ------------------------------------------------------------
  Full         Melihat, membuat, mengubah, dan menghapus sesuai kebijakan
  Edit         Melihat dan mengubah data yang diizinkan
  View         Hanya melihat
  Limited      Akses terbatas pada data atau tindakan tertentu
  None         Tidak memiliki akses

### 3.3 Initial Permission Matrix

  Module              Primary Couple   Partner    Family   Coordinator           Guest
  ----------------- ---------------- --------- --------- ------------- ---------------
  Wedding Profile               Full      Edit      View          View            None
  Dashboard                     Full      Edit      View          View            None
  Checklist                     Full      Edit   Limited          Edit            None
  Budget                        Full      Edit   Limited       Limited            None
  Vendor                        Full      Edit      View          Edit            None
  Guest List                    Full      Edit   Limited          Edit            None
  Calendar                      Full      Edit      View          Edit            None
  Documents                     Full      Edit   Limited       Limited            None
  RSVP                          Full      Edit      None          View   Edit own RSVP
  QR Check-in                   Full      Edit      None          Edit            None

**Implementation notes:** - Primary Couple dan Partner menggunakan akun
terpisah. - Permission dapat diatur per anggota dan per modul. - Guest
tidak mendapatkan akses ke workspace; guest hanya mengakses halaman
undangan dan RSVP miliknya. - Platform Admin memiliki akses operasional
SaaS melalui admin portal, dengan audit log untuk aktivitas
administratif. - Terapkan prinsip least privilege.

## 4. Functional Requirements

Priority definitions:

-   **P0 --- Must Have:** wajib untuk rilis target.
-   **P1 --- Should Have:** penting, tetapi dapat diprioritaskan setelah
    alur inti stabil.
-   **P2 --- Could Have:** pengembangan lanjutan.

### 4.1 Authentication & User Management

  -----------------------------------------------------------------------
  ID                Feature           Description       Priority
  ----------------- ----------------- ----------------- -----------------
  AUTH-01           Registration      Registrasi        P0
                                      menggunakan email 
                                      atau nomor        
                                      telepon           

  AUTH-02           Login             Login menggunakan P0
                                      email/password    

  AUTH-03           Social Login      Google Sign-In    P1

  AUTH-04           Email             Verifikasi alamat P0
                    Verification      email             

  AUTH-05           Forgot Password   Pemulihan         P0
                                      password          

  AUTH-06           User Profile      Pengelolaan       P0
                                      profil pengguna   

  AUTH-07           Couple Invitation Mengundang        P0
                                      partner ke        
                                      workspace         

  AUTH-08           Role Management   Mengelola role    P0
                                      dan permission    
                                      anggota           

  AUTH-09           Session           Logout dan        P0
                    Management        pengelolaan sesi  

  AUTH-10           Account           Menonaktifkan     P1
                    Deactivation      akun sesuai       
                                      kebijakan         
  -----------------------------------------------------------------------

### 4.2 Wedding Workspace & Setup

Setiap pasangan memiliki satu workspace utama pada paket awal. Sistem
perlu dirancang agar aturan jumlah workspace dapat dikonfigurasi
berdasarkan subscription plan.

  -----------------------------------------------------------------------
  ID                Feature           Description       Priority
  ----------------- ----------------- ----------------- -----------------
  WKS-01            Create Wedding    Membuat wedding   P0
                                      workspace         

  WKS-02            Couple Profile    Data calon        P0
                                      pengantin         

  WKS-03            Wedding           Nama pasangan,    P0
                    Information       tanggal, dan      
                                      lokasi            

  WKS-04            Wedding Concept   Tema, warna, dan  P1
                                      konsep acara      

  WKS-05            Event             Akad, resepsi,    P0
                    Configuration     engagement, dan   
                                      acara lainnya     

  WKS-06            Wedding Countdown Hitung mundur     P0
                                      hari pernikahan   

  WKS-07            Workspace         Pengaturan        P0
                    Settings          workspace         

  WKS-08            Multiple Events   Mengelola         P0
                                      beberapa          
                                      rangkaian acara   

  WKS-09            Onboarding Wizard Panduan setup     P0
                                      awal workspace    
  -----------------------------------------------------------------------

### 4.3 Wedding Dashboard

  ID       Feature             Description                          Priority
  -------- ------------------- ------------------------------------ ----------
  DSH-01   Wedding Countdown   Countdown menuju hari pernikahan     P0
  DSH-02   Planning Progress   Ringkasan progress persiapan         P0
  DSH-03   Budget Overview     Ringkasan anggaran dan pengeluaran   P0
  DSH-04   Upcoming Tasks      Daftar tugas terdekat                P0
  DSH-05   Upcoming Events     Jadwal kegiatan terdekat             P0
  DSH-06   Vendor Overview     Ringkasan vendor terpilih            P1
  DSH-07   Guest Overview      Ringkasan jumlah tamu dan RSVP       P1
  DSH-08   Recent Activities   Riwayat aktivitas terbaru            P1
  DSH-09   Quick Actions       Shortcut ke aktivitas utama          P1

### 4.4 Checklist & Task Management

  -----------------------------------------------------------------------
  ID                Feature           Description       Priority
  ----------------- ----------------- ----------------- -----------------
  TSK-01            Checklist         Template          P0
                    Templates         berdasarkan       
                                      tahapan persiapan 

  TSK-02            Custom Tasks      Membuat tugas     P0
                                      sendiri           

  TSK-03            Task Categories   Kategori tugas    P0

  TSK-04            Task Assignment   Menugaskan tugas  P0
                                      kepada anggota    

  TSK-05            Due Date          Menentukan        P0
                                      tenggat waktu     

  TSK-06            Priority          Low, medium, high P1

  TSK-07            Task Status       To Do, In         P0
                                      Progress,         
                                      Completed         

  TSK-08            Task Reminder     Pengingat         P1
                                      otomatis          

  TSK-09            Task Notes        Catatan tugas     P1

  TSK-10            Task Attachments  Lampiran gambar   P1
                                      atau dokumen      

  TSK-11            Recurring Tasks   Tugas berulang    P2
                                      bila diperlukan   
  -----------------------------------------------------------------------

Checklist template dapat dikelompokkan berdasarkan milestone seperti
H-365, H-180, H-90, H-30, H-7, H-1, dan Wedding Day. Template harus
dapat dikonfigurasi dan tanggal tugas dihitung berdasarkan tanggal acara
terkait.

### 4.5 Budget & Expense Management

  -----------------------------------------------------------------------
  ID                Feature           Description       Priority
  ----------------- ----------------- ----------------- -----------------
  BGT-01            Budget Planning   Menentukan total  P0
                                      anggaran          

  BGT-02            Budget Categories Kategori          P0
                                      pengeluaran       

  BGT-03            Budget Allocation Alokasi dana per  P0
                                      kategori          

  BGT-04            Expense Recording Mencatat          P0
                                      pengeluaran       

  BGT-05            Estimated Cost    Estimasi biaya    P0

  BGT-06            Actual Cost       Biaya aktual      P0

  BGT-07            Payment Tracking  Monitoring        P0
                                      pembayaran        

  BGT-08            DP Management     Pencatatan uang   P0
                                      muka              

  BGT-09            Payment Reminder  Pengingat jatuh   P1
                                      tempo             

  BGT-10            Financial Reports Laporan keuangan  P1

  BGT-11            Budget Comparison Perbandingan      P1
                                      estimasi dan      
                                      realisasi         

  BGT-12            Expense           Bukti transaksi   P1
                    Attachment                          

  BGT-13            Export Report     Export laporan    P1
  -----------------------------------------------------------------------

Initial expense categories: - Venue - Catering - Decoration - Makeup
Artist - Attire - Photography - Videography - Entertainment -
Invitation - Souvenir - Transportation - Accommodation -
Administration - Miscellaneous

Business rules: - Total actual expense dihitung dari transaksi
pengeluaran yang valid. - Pembayaran vendor dan expense harus dapat
ditautkan agar tidak terjadi pencatatan ganda. - Sistem harus membedakan
estimasi, komitmen biaya/quotation, pembayaran, dan realisasi
pengeluaran. - Perubahan transaksi penting dicatat dalam activity log.

### 4.6 Vendor Personal Management

Pada fase awal, vendor management adalah database pribadi pasangan,
bukan marketplace publik.

  ---------------------------------------------------------------------------
  ID                Feature           Description           Priority
  ----------------- ----------------- --------------------- -----------------
  VND-01            Vendor Directory  Daftar vendor milik   P0
                                      workspace             

  VND-02            Vendor Categories Kategori vendor       P0

  VND-03            Vendor Profile    Nama, kontak, alamat, P0
                                      dan informasi vendor  

  VND-04            Vendor Portfolio  Foto atau tautan      P1
                                      portofolio            

  VND-05            Vendor Shortlist  Menandai vendor       P1
                                      favorit               

  VND-06            Vendor Comparison Membandingkan vendor  P1

  VND-07            Vendor Booking    Mencatat vendor       P0
                                      terpilih/terbooking   

  VND-08            Quotation         Menyimpan penawaran   P0
                    Management                              

  VND-09            Contract          Menyimpan kontrak     P1
                    Management                              

  VND-10            Vendor Payment    Mencatat pembayaran   P0
                                      vendor                

  VND-11            Vendor Notes      Catatan komunikasi    P1
  ---------------------------------------------------------------------------

### 4.7 Guest & Invitation Management

  -----------------------------------------------------------------------
  ID                Feature           Description       Priority
  ----------------- ----------------- ----------------- -----------------
  GST-01            Guest Database    Database tamu     P0

  GST-02            Guest Categories  Keluarga, teman,  P0
                                      kolega, dan       
                                      lainnya           

  GST-03            Guest Import      Import Excel/CSV  P1

  GST-04            Digital           Membuat undangan  P1
                    Invitation        digital           

  GST-05            Invitation Link   Link undangan     P1
                                      personal          

  GST-06            RSVP              Konfirmasi        P1
                                      kehadiran         

  GST-07            Guest             Status konfirmasi P1
                    Confirmation                        

  GST-08            QR Code           QR code undangan  P1

  GST-09            Guest Check-in    Scan QR saat      P1
                                      acara             

  GST-10            Attendance Report Laporan kehadiran P1

  GST-11            Guest Export      Export data tamu  P1
  -----------------------------------------------------------------------

Guest data fields should be configurable and limited to information
necessary for invitation and event operations.

### 4.8 Calendar & Timeline

  ID       Feature               Description                       Priority
  -------- --------------------- --------------------------------- ----------
  CAL-01   Wedding Calendar      Kalender persiapan                P0
  CAL-02   Event Scheduling      Membuat jadwal acara              P0
  CAL-03   Task Scheduling       Menjadwalkan tugas                P0
  CAL-04   Timeline View         Tampilan timeline                 P1
  CAL-05   Event Reminder        Pengingat acara                   P1
  CAL-06   Calendar Sync         Sinkronisasi kalender eksternal   P2
  CAL-07   Wedding Day Rundown   Rundown hari pernikahan           P1

### 4.9 Document & Media Management

  ID       Feature            Description                         Priority
  -------- ------------------ ----------------------------------- ----------
  DOC-01   Document Upload    Upload dokumen                      P0
  DOC-02   File Categories    Kategori file                       P0
  DOC-03   Image Gallery      Galeri referensi                    P1
  DOC-04   Moodboard          Kumpulan inspirasi visual           P1
  DOC-05   Contract Storage   Penyimpanan kontrak                 P1
  DOC-06   Document Sharing   Berbagi dokumen sesuai permission   P1
  DOC-07   File Preview       Preview dokumen                     P1
  DOC-08   File Download      Download dokumen                    P0

### 4.10 Collaboration & Notification

  ID       Feature                 Description                         Priority
  -------- ----------------------- ----------------------------------- ----------
  COL-01   Couple Collaboration    Kolaborasi pasangan                 P0
  COL-02   Family Access           Akses keluarga                      P1
  COL-03   Comments                Komentar pada task atau aktivitas   P1
  COL-04   Activity Log            Riwayat aktivitas                   P0
  COL-05   In-App Notification     Notifikasi dalam aplikasi           P0
  COL-06   Email Notification      Notifikasi email                    P1
  COL-07   Push Notification       Notifikasi mobile                   P1
  COL-08   WhatsApp Notification   Reminder melalui WhatsApp API       P2

### 4.11 Subscription & SaaS Management

  ID       Feature                 Description                  Priority
  -------- ----------------------- ---------------------------- ----------
  SUB-01   Subscription Plans      Pengelolaan paket            P0
  SUB-02   Free Trial              Masa uji coba                P1
  SUB-03   Subscription Checkout   Pembelian paket              P0
  SUB-04   Payment Integration     Integrasi payment gateway    P0
  SUB-05   Subscription Status     Status langganan             P0
  SUB-06   Renewal Management      Perpanjangan langganan       P0
  SUB-07   Feature Restriction     Pembatasan fitur per paket   P0
  SUB-08   Subscription History    Riwayat langganan            P1
  SUB-09   Invoice                 Invoice pembayaran           P1
  SUB-10   Cancellation            Pembatalan langganan         P0

### 4.12 Platform Administration

  ID       Feature                 Description             Priority
  -------- ----------------------- ----------------------- ----------
  ADM-01   Admin Dashboard         Statistik platform      P0
  ADM-02   User Management         Pengelolaan pengguna    P0
  ADM-03   Workspace Management    Pengelolaan workspace   P0
  ADM-04   Plan Management         Pengaturan paket        P0
  ADM-05   Payment Monitoring      Monitoring transaksi    P0
  ADM-06   Feature Configuration   Konfigurasi fitur       P1
  ADM-07   Content Management      Pengelolaan template    P1
  ADM-08   System Logs             Log sistem              P0
  ADM-09   Support Management      Pengelolaan bantuan     P1

## 5. Key User Workflows

### 5.1 Registration & Onboarding

1.  User membuka aplikasi.
2.  User melakukan registrasi.
3.  Sistem memverifikasi email atau nomor telepon.
4.  User membuat wedding workspace.
5.  User mengisi data kedua calon pengantin.
6.  User menentukan tanggal dan lokasi pernikahan.
7.  User mengatur jenis rangkaian acara.
8.  User mengundang partner.
9.  Sistem membuat dashboard dan checklist awal.
10. User diarahkan ke dashboard.

### 5.2 Wedding Planning

1.  User membuka dashboard.
2.  User melihat rekomendasi checklist.
3.  User mengatur budget.
4.  User membuat task dan deadline.
5.  User menentukan PIC.
6.  User menambahkan jadwal.
7.  User memperbarui progress.
8.  Sistem memperbarui ringkasan dashboard.

### 5.3 Budget Management

1.  User menentukan total budget.
2.  User mengalokasikan dana berdasarkan kategori.
3.  User memasukkan estimasi biaya.
4.  User memilih atau menambahkan vendor.
5.  User mencatat quotation.
6.  User mencatat DP dan pembayaran berikutnya.
7.  User memasukkan realisasi pengeluaran.
8.  Sistem menghitung sisa budget dan menampilkan perbandingan.

### 5.4 Vendor Selection

1.  User membuka vendor directory.
2.  User memilih kategori.
3.  User menambahkan detail vendor atau memilih dari sumber yang
    tersedia.
4.  User menyimpan vendor ke shortlist.
5.  User membandingkan quotation.
6.  User memilih vendor.
7.  User menyimpan kontrak.
8.  User menghubungkan vendor dengan budget.
9.  User mencatat pembayaran.

### 5.5 Guest Invitation

1.  User menambahkan tamu manual atau import file.
2.  User mengelompokkan tamu.
3.  User membuat undangan digital.
4.  Sistem membuat link undangan personal.
5.  User membagikan undangan.
6.  Guest membuka undangan.
7.  Guest melakukan RSVP.
8.  Sistem memperbarui status RSVP.
9.  Sistem membuat QR code jika fitur aktif.
10. Petugas melakukan check-in pada hari acara.

### 5.6 Wedding Day

1.  User membuka Wedding Day Dashboard.
2.  User melihat rundown.
3.  User memeriksa status agenda dan tugas.
4.  User memantau PIC.
5.  Petugas memindai QR tamu.
6.  Sistem memperbarui jumlah kehadiran.
7.  User menandai agenda selesai.
8.  Sistem menyediakan ringkasan pelaksanaan.

## 6. Non-Functional Requirements

  -----------------------------------------------------------------------
  ID                      Category                Requirement
  ----------------------- ----------------------- -----------------------
  NFR-01                  Security                Password hashing,
                                                  secure session, and
                                                  secure authentication

  NFR-02                  Authorization           RBAC at workspace and
                                                  resource level

  NFR-03                  Multi-tenancy           Data antar-workspace
                                                  harus terisolasi

  NFR-04                  Performance             Target API response
                                                  normal \< 500 ms untuk
                                                  request yang tidak
                                                  melibatkan proses
                                                  berat, diukur pada
                                                  kondisi beban yang
                                                  disepakati

  NFR-05                  Availability            Target uptime awal
                                                  99.5% per bulan, tidak
                                                  termasuk maintenance
                                                  terjadwal

  NFR-06                  Scalability             Mendukung pertumbuhan
                                                  user dan workspace

  NFR-07                  Responsive              Mendukung desktop,
                                                  tablet, dan mobile

  NFR-08                  Data Backup             Backup database
                                                  terjadwal dan prosedur
                                                  restore diuji

  NFR-09                  Data Privacy            Perlindungan data
                                                  pribadi sesuai
                                                  peraturan yang berlaku

  NFR-10                  Audit Trail             Pencatatan aktivitas
                                                  penting

  NFR-11                  Integration             API untuk layanan pihak
                                                  ketiga

  NFR-12                  Maintainability         Modular architecture
                                                  dan dokumentasi teknis

  NFR-13                  Accessibility           Kontras, label,
                                                  navigasi, dan ukuran
                                                  target interaksi yang
                                                  layak

  NFR-14                  Localization            Bahasa Indonesia dan
                                                  dukungan format
                                                  tanggal, waktu, serta
                                                  mata uang lokal
  -----------------------------------------------------------------------

### 6.1 Security & Privacy Notes

-   Terapkan tenant/workspace isolation pada seluruh query dan operasi
    data.
-   Validasi permission di backend; jangan hanya mengandalkan
    penyembunyian UI.
-   Gunakan signed URL atau mekanisme akses aman untuk file privat.
-   Batasi ukuran, tipe, dan jumlah file upload.
-   Gunakan rate limiting untuk endpoint sensitif.
-   Catat perubahan penting pada budget, pembayaran, role, dan data
    tamu.
-   Sediakan kebijakan retensi, ekspor, dan penghapusan data.
-   Terapkan prinsip minimisasi data pribadi.
-   Evaluasi kewajiban berdasarkan UU Perlindungan Data Pribadi
    Indonesia.
-   Lakukan security testing sebelum production release.

## 7. SaaS Subscription Model

### 7.1 Proposed Plans

  Feature                    Free     Premium   Premium Plus
  ---------------------- -------- ----------- --------------
  Wedding Workspace             1           1              1
  Couple Collaboration        Yes         Yes            Yes
  Checklist                 Basic   Unlimited      Unlimited
  Budget Management         Basic    Advanced       Advanced
  Vendor Records                5   Unlimited      Unlimited
  Guest Records                50         500    Unlimited\*
  Digital Invitation        Basic     Premium        Premium
  QR Check-in                  No         Yes            Yes
  Seating Planner              No          No            Yes
  Storage                  100 MB        2 GB          10 GB
  AI Assistant                 No     Limited       Advanced

*Unlimited subject to fair-use policy and technical limits.*

### 7.2 Subscription Considerations

-   Pertimbangkan wedding-based subscription atau paket berdurasi 12
    bulan.
-   Paket, harga, kuota, dan feature entitlements harus dapat diatur
    dari admin.
-   Sistem harus menangani status trial, active, past due, expired,
    cancelled, dan refunded jika relevan.
-   Perubahan paket tidak boleh menghapus data pengguna.
-   Jika kuota terlampaui, sistem harus menerapkan kebijakan yang jelas
    dan tidak menghilangkan data.
-   Pembayaran subscription dipisahkan dari pembayaran vendor oleh
    pasangan.

## 8. Scope of Development

### Phase 1 --- Core Platform

**Goal:** pasangan dapat mengelola persiapan pernikahan melalui satu
platform.

Included: - Authentication & User Management - Wedding Workspace &
Setup - Wedding Dashboard - Checklist & Task Management - Budget &
Expense Management - Vendor Personal Management - Guest Management -
Calendar & Timeline - Document Management - Couple Collaboration - Basic
Notification - SaaS Subscription - Platform Administration

### Phase 2 --- Wedding Experience

**Goal:** mendukung pengalaman undangan digital dan operasional hari
pernikahan.

Included: - Digital Wedding Invitation - Personal Invitation Link - RSVP
Management - QR Code Generation - QR Guest Check-in - Wedding Day
Command Center - Seating Planner - Advanced Collaboration - WhatsApp
Notification - Calendar Integration - Moodboard & Approval

### Phase 3 --- Ecosystem & Intelligence

**Goal:** memperluas ekosistem dan otomatisasi.

Included: - AI Wedding Assistant - AI Budget Recommendation - AI
Checklist Generator - Public Vendor Marketplace - Vendor Booking
Integration - Vendor Rating & Review - Advanced Analytics - White-label
Wedding Website - Automated Financial Reporting

### 8.1 Initial Release Recommendation

Untuk Professional Edition, target rilis komersial awal disarankan
mencakup: - Seluruh fitur inti Phase 1. - Digital invitation dan RSVP
dasar. - QR code dan check-in dasar. - Wedding Day Rundown. - Payment
gateway untuk subscription. - Admin portal untuk operasional SaaS.

Marketplace penuh, AI generatif, dan integrasi kompleks tetap menjadi
roadmap lanjutan.

## 9. Scope Exclusions

  Feature                          Scope Status
  -------------------------------- -------------------------------
  Full public vendor marketplace   Excluded from initial release
  AI image generation              Excluded from initial release
  AI chatbot                       Future phase
  Live wedding streaming           Excluded
  Full Wedding Organizer ERP       Excluded
  Vendor accounting system         Excluded
  Native desktop application       Excluded
  Advanced seating optimization    Future phase
  Multi-country payment            Excluded from initial release

## 10. Technical Architecture

### 10.1 Architecture Approach

Gunakan **modular monolith** untuk versi awal. Pisahkan domain dan modul
secara jelas agar pengembangan dan pengujian terstruktur. Microservices
dapat dipertimbangkan jika kebutuhan skala dan operasional sudah
membenarkannya.

### 10.2 Proposed Technology Stack

  Layer               Proposed Technology
  ------------------- -------------------------------------------------
  Web Frontend        Next.js
  Mobile              Flutter
  Backend             NestJS
  Database            PostgreSQL
  ORM                 Prisma
  Cache               Redis
  Authentication      JWT + Refresh Token / managed identity solution
  Realtime            WebSocket, jika diperlukan
  Background Jobs     BullMQ
  File Storage        S3-compatible object storage
  API Documentation   Swagger / OpenAPI
  Deployment          Docker
  CI/CD               GitHub Actions
  Monitoring          Centralized logs, metrics, and error tracking

Technology choices are recommendations and must be confirmed during
technical discovery.

### 10.3 Logical Architecture

``` mermaid
flowchart TB
    subgraph CLIENT["Client Applications"]
        WEB["Web Application - Next.js"]
        MOB["Mobile Application - Flutter"]
        ADM["SaaS Admin Portal"]
        GUEST["Guest Invitation Web"]
    end

    subgraph BACKEND["Backend Platform - NestJS"]
        API["API Layer"]
        AUTH["Authentication & RBAC"]
        WED["Wedding Workspace & Events"]
        TASK["Checklist & Tasks"]
        BUD["Budget & Expenses"]
        VEN["Vendor Management"]
        GST["Guest & Invitation"]
        SUB["Subscription & Billing"]
        NOTIF["Notification"]
    end

    subgraph DATA["Infrastructure"]
        DB[("PostgreSQL")]
        CACHE[("Redis")]
        FILE[("S3 Object Storage")]
        QUEUE["Background Jobs"]
    end

    subgraph EXT["External Services"]
        PAY["Payment Gateway"]
        WA["WhatsApp Provider"]
        MAIL["Email Provider"]
        PUSH["Push Notification Provider"]
    end

    WEB --> API
    MOB --> API
    ADM --> API
    GUEST --> API

    API --> AUTH
    API --> WED
    API --> TASK
    API --> BUD
    API --> VEN
    API --> GST
    API --> SUB
    API --> NOTIF

    AUTH --> DB
    WED --> DB
    TASK --> DB
    BUD --> DB
    VEN --> DB
    GST --> DB
    SUB --> DB

    API --> CACHE
    API --> FILE
    NOTIF --> QUEUE
    QUEUE --> WA
    QUEUE --> MAIL
    QUEUE --> PUSH
    SUB --> PAY
```

### 10.4 Multi-Tenancy Requirements

-   Setiap wedding workspace memiliki tenant boundary yang jelas.
-   Seluruh tabel domain harus memiliki `workspace_id` atau relasi
    kepemilikan yang tervalidasi.
-   Backend harus memvalidasi membership dan permission pada setiap
    operasi.
-   Jangan menerima `workspace_id` dari client sebagai bukti otorisasi.
-   Terapkan composite indexes yang sesuai, misalnya
    `(workspace_id, created_at)`.
-   Pertimbangkan PostgreSQL Row-Level Security sebagai lapisan
    pertahanan tambahan.
-   Admin access harus terpisah dan diaudit.
-   File storage path dan akses file harus mengikuti workspace
    permission.

## 11. Initial Database Domain Model

### 11.1 Core Entities

1.  `users`
2.  `wedding_workspaces`
3.  `workspace_members`
4.  `roles`
5.  `permissions`
6.  `wedding_events`
7.  `tasks`
8.  `task_categories`
9.  `budgets`
10. `budget_categories`
11. `expenses`
12. `vendors`
13. `wedding_vendors`
14. `vendor_quotations`
15. `vendor_payments`
16. `guests`
17. `invitations`
18. `rsvps`
19. `check_ins`
20. `documents`
21. `notifications`
22. `activity_logs`
23. `subscription_plans`
24. `subscriptions`
25. `payment_transactions`

### 11.2 Relationship Overview

``` mermaid
erDiagram
    USERS ||--o{ WORKSPACE_MEMBERS : joins
    WEDDING_WORKSPACES ||--o{ WORKSPACE_MEMBERS : contains
    WEDDING_WORKSPACES ||--o{ WEDDING_EVENTS : has
    WEDDING_WORKSPACES ||--o{ TASKS : manages
    WEDDING_WORKSPACES ||--o{ BUDGETS : owns
    WEDDING_WORKSPACES ||--o{ EXPENSES : records
    WEDDING_WORKSPACES ||--o{ WEDDING_VENDORS : selects
    WEDDING_WORKSPACES ||--o{ GUESTS : invites
    WEDDING_WORKSPACES ||--o{ DOCUMENTS : stores
    WEDDING_WORKSPACES ||--o{ SUBSCRIPTIONS : subscribes
    VENDORS ||--o{ WEDDING_VENDORS : referenced_by
    TASKS }o--o| USERS : assigned_to
    GUESTS ||--o{ RSVPS : responds
    GUESTS ||--o| CHECK_INS : attends
    BUDGETS ||--o{ EXPENSES : contains
    USERS ||--o{ NOTIFICATIONS : receives
```

This is a logical model, not a finalized physical schema. Field
definitions, constraints, indexes, deletion policies, and status
transitions must be specified during technical design.

### 11.3 Suggested Common Fields

For workspace-owned entities, consider: - `id` - `workspace_id` -
`created_at` - `updated_at` - `created_by` - `updated_by` - `deleted_at`
where soft deletion is appropriate

Use UUIDs or another consistent identifier strategy. Store timestamps
consistently and render them in the user's configured timezone.

## 12. API Design Guidelines

-   Use REST API with version prefix, for example `/api/v1`.
-   Use consistent response envelopes and error codes.
-   Validate all request payloads server-side.
-   Apply authorization at resource level.
-   Use pagination and filtering for lists.
-   Use idempotency keys for payment-related operations where
    applicable.
-   Use webhook signature verification for payment callbacks.
-   Document endpoints with OpenAPI.
-   Avoid exposing internal database identifiers or sensitive data
    unnecessarily.

Example endpoint groups:

  Domain          Example Endpoints
  --------------- ------------------------------------------------
  Auth            `/api/v1/auth/register`, `/login`, `/refresh`
  Workspace       `/api/v1/workspaces`, `/api/v1/workspaces/:id`
  Members         `/api/v1/workspaces/:id/members`
  Events          `/api/v1/workspaces/:id/events`
  Tasks           `/api/v1/workspaces/:id/tasks`
  Budgets         `/api/v1/workspaces/:id/budgets`
  Expenses        `/api/v1/workspaces/:id/expenses`
  Vendors         `/api/v1/workspaces/:id/vendors`
  Guests          `/api/v1/workspaces/:id/guests`
  Invitations     `/api/v1/invitations`
  RSVP            `/api/v1/invitations/:token/rsvp`
  Subscriptions   `/api/v1/subscriptions`
  Admin           `/api/v1/admin/*`

Endpoint examples are indicative and must be finalized in API design.

## 13. Acceptance Criteria

  -----------------------------------------------------------------------
  Area                                Acceptance Criteria
  ----------------------------------- -----------------------------------
  Authentication                      User dapat registrasi, login,
                                      logout, dan reset password

  Workspace                           Couple dapat membuat workspace dan
                                      mengundang partner

  Authorization                       Pengguna tidak dapat mengakses
                                      workspace tanpa membership dan
                                      permission

  Dashboard                           Data dashboard sesuai workspace
                                      aktif

  Checklist                           Task dapat dibuat, diperbarui,
                                      ditugaskan, dan diselesaikan

  Budget                              Estimasi, pembayaran, dan realisasi
                                      dihitung secara konsisten

  Vendor                              Vendor dapat disimpan, dipilih, dan
                                      dikaitkan dengan quotation

  Guest                               Data tamu dapat dibuat, diubah, dan
                                      diimpor sesuai template

  RSVP                                Guest dapat mengirim RSVP melalui
                                      link yang valid

  QR Check-in                         QR valid dapat dipindai dan
                                      check-in tidak tercatat ganda tanpa
                                      aturan yang jelas

  Calendar                            Event dan task tampil pada tanggal
                                      yang benar

  Documents                           File dapat diunggah dan diakses
                                      sesuai permission

  Subscription                        Feature entitlement mengikuti paket
                                      dan status subscription

  Admin                               Admin dapat mengelola paket, user,
                                      dan workspace sesuai kewenangan

  Mobile                              Fungsi utama tersedia dan
                                      tersinkronisasi dengan backend

  Security                            Uji akses lintas-workspace tidak
                                      menunjukkan kebocoran data
  -----------------------------------------------------------------------

## 14. Development Deliverables

  -----------------------------------------------------------------------
  No.                     Deliverable             Output
  ----------------------- ----------------------- -----------------------
  1                       Product Requirements    PRD dan functional
                                                  requirements

  2                       UX Research & Flow      User journey, user
                                                  flow, information
                                                  architecture

  3                       UI/UX Design            Wireframe dan
                                                  high-fidelity design

  4                       System Architecture     Architecture diagram
                                                  dan technical decisions

  5                       Database Design         ERD, schema, migration

  6                       Backend Development     API dan business logic

  7                       Web Development         Web application

  8                       Mobile Development      Android dan iOS
                                                  application

  9                       Admin Development       SaaS admin dashboard

  10                      Integration             Payment, email, push,
                                                  dan layanan lain yang
                                                  disepakati

  11                      Testing                 Functional,
                                                  integration, security,
                                                  dan UAT

  12                      Deployment              Production environment
                                                  dan CI/CD

  13                      Documentation           Technical dan user
                                                  documentation

  14                      Handover                Source code dan
                                                  deployment handover
  -----------------------------------------------------------------------

## 15. Indicative Development Roadmap

Estimasi awal: **20--24 minggu**, dengan pekerjaan paralel. Estimasi ini
belum merupakan komitmen jadwal dan perlu divalidasi melalui discovery,
detail scope, kapasitas tim, serta keputusan platform.

  -----------------------------------------------------------------------
  Phase                   Activities              Indicative Schedule
  ----------------------- ----------------------- -----------------------
  1                       Discovery, PRD, UX      Week 1--4
                          research, user flow,    
                          UI/UX, architecture     

  2                       Backend foundation,     Week 3--8
                          authentication,         
                          workspace, RBAC,        
                          subscription            

  3                       Web and mobile core     Week 6--15
                          modules                 

  4                       Invitation, RSVP, QR,   Week 13--19
                          rundown, notifications  

  5                       Integration, QA,        Week 17--22
                          security testing, UAT   

  6                       Production deployment   Week 23--24
                          and handover            
  -----------------------------------------------------------------------

### 15.1 Milestones

-   M1: Product scope and UX approved.
-   M2: Architecture and core backend ready.
-   M3: Core web/mobile workflows ready for internal testing.
-   M4: Invitation and event workflows integrated.
-   M5: UAT completed and critical defects resolved.
-   M6: Production release and handover.

## 16. Assumptions & Dependencies

### 16.1 Assumptions

1.  Target market awal adalah Indonesia.
2.  Bahasa utama aplikasi adalah Bahasa Indonesia.
3.  Web dan mobile menggunakan backend yang sama.
4.  Mobile application menggunakan Flutter.
5.  Vendor management awal adalah database pribadi pasangan.
6.  Digital invitation dan RSVP dasar menjadi bagian dari rilis
    komersial awal.
7.  Payment gateway digunakan untuk pembayaran subscription.
8.  Integrasi WhatsApp bergantung pada provider, approval, template, dan
    biaya layanan.
9.  Harga paket dan kuota ditentukan melalui validasi pasar.
10. Konten checklist dan template awal disediakan atau disetujui product
    owner.

### 16.2 Dependencies

-   Payment gateway account dan API credentials.
-   Email delivery provider.
-   Push notification provider.
-   Object storage.
-   Domain, hosting, dan production infrastructure.
-   App Store dan Google Play developer accounts.
-   WhatsApp Business provider jika integrasi WhatsApp masuk scope.
-   Legal review untuk terms of service, privacy policy, dan pengelolaan
    data pribadi.

## 17. Out of Scope for Initial Release

-   Full public vendor marketplace.
-   AI image generation.
-   AI chatbot atau AI assistant tingkat lanjut.
-   Live wedding streaming.
-   Full ERP untuk Wedding Organizer.
-   Vendor accounting system.
-   Native desktop application.
-   Advanced seating optimization.
-   Multi-country payment.
-   Integrasi khusus yang belum disepakati.

## 18. Product Risks

  -----------------------------------------------------------------------
  Risk                    Impact                  Mitigation
  ----------------------- ----------------------- -----------------------
  Scope creep             Timeline dan biaya      Prioritas P0/P1/P2 dan
                          meningkat               change control

  Multi-tenant data       Risiko privasi dan      Tenant isolation,
  leakage                 keamanan                authorization tests,
                                                  security review

  Low user activation     Pengguna tidak          Onboarding sederhana
                          menyelesaikan           dan template siap pakai
                          onboarding              

  Vendor data quality     Informasi vendor tidak  Validasi input dan
                          konsisten               sumber data yang jelas

  Payment integration     Subscription release    Sandbox integration dan
  delays                  tertunda                fallback plan

  WhatsApp provider       Notifikasi tertunda     Email/push sebagai
  dependency              atau mahal              kanal dasar

  Mobile store review     Rilis mobile tertunda   Siapkan akun dan proses
                                                  submission lebih awal

  File storage growth     Biaya infrastruktur     Kuota paket,
                          meningkat               compression, lifecycle
                                                  policy
  -----------------------------------------------------------------------

## 19. Success Metrics

Initial product metrics to validate after launch:

  -----------------------------------------------------------------------
  Metric                              Purpose
  ----------------------------------- -----------------------------------
  Registration-to-workspace           Mengukur keberhasilan onboarding
  conversion                          

  Workspace activation rate           Mengukur pengguna yang mulai
                                      membuat rencana

  Weekly active workspaces            Mengukur penggunaan aktif

  Checklist completion rate           Mengukur penggunaan task management

  Budget entries per workspace        Mengukur adopsi budgeting

  Guest RSVP completion rate          Mengukur penggunaan undangan

  Free-to-paid conversion             Mengukur monetisasi

  Subscription renewal rate           Mengukur retensi

  Support ticket rate                 Mengukur kualitas pengalaman
                                      pengguna
  -----------------------------------------------------------------------

Target angka ditetapkan setelah baseline dari pilot atau beta testing
tersedia.

## 20. Open Decisions Before Development

Keputusan berikut perlu dikonfirmasi oleh product owner:

  -----------------------------------------------------------------------
  Topic                   Options                 Recommended Starting
                                                  Point
  ----------------------- ----------------------- -----------------------
  Product Name            Wedora / other          Working title Wedora

  Digital Invitation      Core / add-on / basic   Core basic invitation +
                                                  RSVP

  Vendor Management       Personal directory /    Personal directory
                          public directory /      
                          marketplace             

  Mobile                  Flutter / PWA first /   Flutter if native app
                          both                    is mandatory

  Subscription Payment    Gateway / manual / both Payment gateway

  Market                  Indonesia / Southeast   Indonesia first
                          Asia / global           

  Subscription Duration   Monthly / annual /      Wedding-based package
                          wedding-based           to test

  Family Access           Fixed roles /           Limited configurable
                          configurable            permissions
                          permissions             

  Coordinator Access      Not available / invited Invited collaborator
                          collaborator            with limited
                                                  permissions
  -----------------------------------------------------------------------

## 21. Recommended Next Steps

1.  Validasi target user melalui wawancara calon pengantin.
2.  Konfirmasi keputusan pada bagian Open Decisions.
3.  Finalisasi P0/P1 untuk rilis pertama.
4.  Susun detailed user stories dan acceptance criteria per fitur.
5.  Buat sitemap dan information architecture.
6.  Buat user flow dan wireframe.
7.  Finalisasi ERD dan API contract.
8.  Susun estimasi person-week dan biaya berdasarkan scope yang
    disetujui.
9.  Susun sprint plan dan release plan.
10. Mulai development setelah product scope dan desain disetujui.

------------------------------------------------------------------------

**Document status:** Draft for Product Discovery\
**Owner:** Product Owner / PT Sundawa Teknologi\
**Version:** 1.0
