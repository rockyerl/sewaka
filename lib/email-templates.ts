const brandPrimary = "#5B132B";
const brandGold = "#D4AF37";
const brandWarm = "#A08F74";

const baseStyle = `
  font-family: 'Georgia', serif;
  color: #333;
  line-height: 1.6;
`;

const containerStyle = `
  max-width: 600px;
  margin: 0 auto;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const headerStyle = `
  background: linear-gradient(135deg, ${brandPrimary}, #4a1025);
  color: #fff;
  padding: 32px 24px;
  text-align: center;
`;

const bodyStyle = `
  padding: 32px 24px;
`;

const footerStyle = `
  background: #f9f6f1;
  padding: 24px;
  text-align: center;
  font-size: 12px;
  color: ${brandWarm};
`;

export function emailWrapper(title: string, content: string): string {
  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 24px 0; background: #f5f5f5;">
  <div style="${containerStyle}">
    <div style="${headerStyle}">
      <h1 style="margin: 0; font-size: 24px; font-weight: 400;">Sewaka</h1>
      <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.8;">Platform Wedding Planning Adat Nusantara</p>
    </div>
    <div style="${bodyStyle} ${baseStyle}">
      ${content}
    </div>
    <div style="${footerStyle}">
      <p>© ${new Date().getFullYear()} Sewaka. Semua hak dilindungi.</p>
      <p style="margin: 4px 0 0 0;">Email ini dikirim otomatis, mohon membalas email ini.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export function verificationCodeTemplate(code: string): string {
  const content = `
    <h2 style="color: ${brandPrimary}; margin: 0 0 16px 0;">Verifikasi Email</h2>
    <p style="margin: 0 0 24px 0;">Terima kasih telah mendaftar di Sewaka. Gunakan kode verifikasi berikut untuk mengaktifkan akun Anda:</p>
    <div style="text-align: center; margin: 32px 0;">
      <div style="display: inline-block; background: #f9f6f1; border: 2px dashed ${brandGold}; border-radius: 12px; padding: 24px 48px;">
        <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: ${brandPrimary};">${code}</span>
      </div>
    </div>
    <p style="margin: 0; font-size: 14px; color: ${brandWarm}; text-align: center;">Kode ini akan kadaluarsa dalam 10 menit.</p>
  `;
  return emailWrapper("Verifikasi Email Anda", content);
}

export function passwordResetTemplate(resetLink: string): string {
  const content = `
    <h2 style="color: ${brandPrimary}; margin: 0 0 16px 0;">Reset Password</h2>
    <p style="margin: 0 0 24px 0;">Anda meminta untuk mereset password akun Sewaka Anda. Klik tombol di bawah untuk membuat password baru:</p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${resetLink}" style="display: inline-block; background: ${brandPrimary}; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px;">Reset Password</a>
    </div>
    <p style="margin: 0; font-size: 14px; color: ${brandWarm};">Jika Anda tidak meminta reset password, abaikan email ini. Link akan kadaluarsa dalam 1 jam.</p>
  `;
  return emailWrapper("Reset Password Sewaka", content);
}

export function taskReminderTemplate(taskTitle: string, dueDate: string): string {
  const content = `
    <h2 style="color: ${brandPrimary}; margin: 0 0 16px 0;">Pengingat Tugas</h2>
    <p style="margin: 0 0 24px 0;">Halo! Ini pengingat bahwa tugas berikut akan segera jatuh tempo:</p>
    <div style="background: #f9f6f1; border-left: 4px solid ${brandGold}; border-radius: 8px; padding: 20px; margin: 24px 0;">
      <h3 style="margin: 0 0 8px 0; color: ${brandPrimary};">${taskTitle}</h3>
      <p style="margin: 0; font-size: 14px; color: ${brandWarm};">Jatuh tempo: ${dueDate}</p>
    </div>
    <p style="margin: 0; font-size: 14px; color: ${brandWarm};">Silakan buka Sewaka untuk melihat detail dan menyelesaikan tugas ini.</p>
  `;
  return emailWrapper("Pengingat Tugas Sewaka", content);
}

export function budgetAlertTemplate(percentage: number, totalBudget: string, totalExpenses: string): string {
  const content = `
    <h2 style="color: ${brandPrimary}; margin: 0 0 16px 0;">⚠️ Peringatan Anggaran</h2>
    <p style="margin: 0 0 24px 0;">Pengeluaran pernikahan Anda sudah mencapai <strong>${percentage.toFixed(0)}%</strong> dari total anggaran.</p>
    <div style="background: #f9f6f1; border-radius: 8px; padding: 20px; margin: 24px 0;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
        <span style="font-size: 14px; color: ${brandWarm};">Total Anggaran</span>
        <span style="font-weight: bold; color: ${brandPrimary};">${totalBudget}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
        <span style="font-size: 14px; color: ${brandWarm};">Total Pengeluaran</span>
        <span style="font-weight: bold; color: ${brandPrimary};">${totalExpenses}</span>
      </div>
      <div style="background: #e0e0e0; border-radius: 4px; height: 8px; overflow: hidden;">
        <div style="background: ${percentage >= 90 ? '#d32f2f' : percentage >= 80 ? brandGold : '#4caf50'}; height: 100%; width: ${Math.min(percentage, 100)}%;"></div>
      </div>
    </div>
    <p style="margin: 0; font-size: 14px; color: ${brandWarm};">Silakan buka Sewaka untuk melihat detail pengeluaran dan mengatur anggaran Anda.</p>
  `;
  return emailWrapper("Peringatan Anggaran Sewaka", content);
}

export function eventReminderTemplate(eventName: string, eventDate: string, location: string): string {
  const content = `
    <h2 style="color: ${brandPrimary}; margin: 0 0 16px 0;">📅 Pengingat Acara</h2>
    <p style="margin: 0 0 24px 0;">Acara pernikahan Anda akan segera berlangsung:</p>
    <div style="background: #f9f6f1; border-left: 4px solid ${brandGold}; border-radius: 8px; padding: 20px; margin: 24px 0;">
      <h3 style="margin: 0 0 8px 0; color: ${brandPrimary};">${eventName}</h3>
      <p style="margin: 4px 0; font-size: 14px; color: ${brandWarm};">📆 ${eventDate}</p>
      ${location ? `<p style="margin: 4px 0; font-size: 14px; color: ${brandWarm};">📍 ${location}</p>` : ""}
    </div>
    <p style="margin: 0; font-size: 14px; color: ${brandWarm};">Pastikan semua persiapan sudah selesai. Buka Sewaka untuk melihat rundown lengkap.</p>
  `;
  return emailWrapper("Pengingat Acara Sewaka", content);
}
