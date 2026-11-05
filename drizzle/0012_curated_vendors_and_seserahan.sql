-- 0012_curated_vendors_and_seserahan.sql
-- Fitur: Direktori Vendor Adat Terkurasi & Tracker Seserahan / Mahar / Hantaran

-- 1. Table curated_vendors
CREATE TABLE IF NOT EXISTS public.curated_vendors (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    tradition text NOT NULL, -- 'JAWA', 'SUNDA', 'MINANG', 'NASIONAL'
    category text NOT NULL,  -- 'PEMAES', 'SANGGAR', 'PRANATACARA', 'MUSIK', 'CATERING', 'FOTOGRAFI'
    tagline text NOT NULL,
    description text NOT NULL,
    location_city text NOT NULL,
    price_range text NOT NULL,
    instagram_handle text,
    whatsapp_number text NOT NULL,
    rating numeric(3, 2) DEFAULT 5.0 NOT NULL,
    review_count integer DEFAULT 12 NOT NULL,
    is_verified boolean DEFAULT true NOT NULL,
    specialties jsonb DEFAULT '[]'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.curated_vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY curated_vendors_read
ON public.curated_vendors
FOR SELECT
TO sewaka_app
USING (true);

GRANT SELECT ON public.curated_vendors TO sewaka_app;

-- 2. Table cultural_seserahan_items
CREATE TABLE IF NOT EXISTS public.cultural_seserahan_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id uuid NOT NULL REFERENCES public.wedding_workspaces(id) ON DELETE CASCADE,
    box_number integer DEFAULT 1 NOT NULL,
    giver_party text DEFAULT 'GROOM_TO_BRIDE' NOT NULL, -- 'GROOM_TO_BRIDE', 'BRIDE_TO_GROOM'
    title text NOT NULL,
    category text DEFAULT 'LAINNYA' NOT NULL,           -- 'MAHAR', 'BUSANA_ADAT', 'PERHIASAN', 'PERLENGKAPAN_IBADAH', 'KOSMETIK', 'KULINER_TRADISIONAL', 'LAINNYA'
    estimated_cost numeric(14, 2) DEFAULT 0 NOT NULL,
    actual_cost numeric(14, 2) DEFAULT 0 NOT NULL,
    status text DEFAULT 'PLANNED' NOT NULL,             -- 'PLANNED', 'PURCHASED', 'DECORATED', 'DELIVERED'
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.cultural_seserahan_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY cultural_seserahan_items_read
ON public.cultural_seserahan_items
FOR SELECT
TO sewaka_app
USING (
    workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid
    AND public.has_workspace_role(
        workspace_id,
        nullif(current_setting('app.user_id', true), '')::uuid,
        null
    )
);

CREATE POLICY cultural_seserahan_items_write
ON public.cultural_seserahan_items
FOR ALL
TO sewaka_app
USING (
    workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid
    AND public.has_workspace_role(
        workspace_id,
        nullif(current_setting('app.user_id', true), '')::uuid,
        ARRAY['OWNER', 'PARTNER', 'COORDINATOR']::text[]
    )
)
WITH CHECK (
    workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid
    AND public.has_workspace_role(
        workspace_id,
        nullif(current_setting('app.user_id', true), '')::uuid,
        ARRAY['OWNER', 'PARTNER', 'COORDINATOR']::text[]
    )
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.cultural_seserahan_items TO sewaka_app;

-- Seed authentic curated traditional vendors
INSERT INTO public.curated_vendors (name, tradition, category, tagline, description, location_city, price_range, instagram_handle, whatsapp_number, rating, review_count, is_verified, specialties)
VALUES
('Sanggar Rias Paes Ageng Sekar Kedhaton', 'JAWA', 'PEMAES', 'Maestro Pemaes Pakem Keraton Yogyakarta & Solo', 'Spesialis tata rias pengantin adat Jawa klasik dengan pakem murni kraton, menggunakan prada emas asli dan cengkorongan sirih sakral.', 'D.I. Yogyakarta & Solo', 'Rp 12.000.000 - Rp 25.000.000', '@sekarkedhaton.paes', '6281298765432', 4.95, 48, true, '["Paes Ageng Kanigaran", "Solo Putri Klasik", "Sungkeman Khidmat", "Upacara Siraman"]'::jsonb),

('Griya Busana Suryo Kencana', 'JAWA', 'SANGGAR', 'Koleksi Dodot Ageng & Beskap Bludru Sulam Emas', 'Penyedia busana pengantin dan keluarga ageng keraton lengkap dengan perhiasan pusaka, cunduk mentul, keris branggah, dan kain cinde asli.', 'Surakarta & Jakarta', 'Rp 15.000.000 - Rp 35.000.000', '@suryokencana.adat', '6281234567891', 4.90, 36, true, '["Dodot Basahan", "Beskap Sikepan Kakung", "Perhiasan Cunduk Mentul Kencana", "Jarik Batik Tulis Klasik"]'::jsonb),

('Ki Pranatacara Budi Rahardjo', 'JAWA', 'PRANATACARA', 'Pemandu Upacara Adat Jawa & Sungkeman Syahdu', 'MC senior adat Jawa dengan penguasaan sastra kawi halus, memandu rangkaian prosesi Pasrah Panampi, Panggih, Kacar-Kucur hingga Boyong Penganten.', 'Semarang & D.I. Yogyakarta', 'Rp 5.000.000 - Rp 10.000.000', '@pranatacara.rahardjo', '6281345678912', 5.00, 62, true, '["Pranatacara Panggih", "Suluk & Tembang Jawa", "Pemandu Siraman", "Prosesi Kacar-Kucur"]'::jsonb),

('Pusaka Laras Gamelan Ensemble', 'JAWA', 'MUSIK', 'Alunan Gamelan Pelog Slendro Keraton & Gending Ageng', 'Grup pemusik gamelan tradisional profesional pengiring ijab khidmat, cucuk lampah panggih penganten, dan klenengan resepsi kraton.', 'Jakarta & Yogyakarta', 'Rp 8.000.000 - Rp 18.000.000', '@pusakalaras.gamelan', '6281567890123', 4.88, 29, true, '["Gending Kebo Giro", "Cucuk Lampah Prajurit", "Gamelan Ageng Keraton", "Sinden Suara Emas"]'::jsonb),

('Sanggar Kusuma Siger Sunda', 'SUNDA', 'PEMAES', 'Tata Rias Siger Sunda Mahkota Kencana & Rereongan', 'Pemaes legendaris spesialis Siger Sunda Kencana dengan ronce melati puspa, daun sirih murni, dan riasan wajah bercahaya lembut.', 'Bandung & Jakarta', 'Rp 10.000.000 - Rp 22.000.000', '@kusumasiger.sunda', '6281987654321', 4.92, 54, true, '["Siger Sunda Kencana", "Rias Halus Natural Pakem", "Ngeuyeuk Seureuh", "Sawer Panganten"]'::jsonb),

('Rampak Kendang & Suling Sunda Parahyangan', 'SUNDA', 'MUSIK', 'Musik Pengiring Adat Sunda & Rampak Kendang Megah', 'Ensemble musik tradisional kecapi suling dan atraksi rampak kendang dinamis untuk prosesi Mapag Panganten yang meriah dan bermakna.', 'Bandung & Bogor', 'Rp 7.500.000 - Rp 15.000.000', '@parahyangan.music', '6282123456789', 4.85, 31, true, '["Kecapi Suling Halus", "Rampak Kendang Mapag", "Pemandu Sawer Sunda", "Huap Lingkung Musik"]'::jsonb),

('Sanggar Minang Ranah Suntiang Ageng', 'MINANG', 'PEMAES', 'Koleksi Suntiang Emas Megah & Anak Daro Istana Basa', 'Pelopor tata rias adat Minang modern & klasik, dengan koleksi suntiang lapis emas bertingkat 9-11 dan busana songket Pandai Sikek tenun asli.', 'Padang & Jakarta', 'Rp 14.000.000 - Rp 30.000.000', '@ranahsuntiang.minang', '6281123456780', 4.96, 42, true, '["Suntiang Gadang Bertingkat", "Songket Pandai Sikek Tenun Tangan", "Malam Bainai", "Manjapuik Marapulai"]'::jsonb),

('Talempong Pacik & Gandang Tabuik Pusako', 'MINANG', 'MUSIK', 'Iringan Musik Tradisional Minangkabau Menggelegar', 'Grup pemusik tradisi Minang membawakan talempong pacik, saluang, dan gandang tasa untuk mengiringi arak-arakan Marapulai dan tari Pasambahan.', 'Jakarta & Bukittinggi', 'Rp 6.000.000 - Rp 14.000.000', '@talempong.pusako', '6285212345678', 4.90, 27, true, '["Tari Pasambahan", "Talempong Pacik Iringan", "Arak-arakan Marapulai", "Saluang Senja Syahdu"]'::jsonb)
ON CONFLICT DO NOTHING;
