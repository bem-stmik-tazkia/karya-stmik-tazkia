const fs = require('fs');
const file = 'src/app/api/moderate-post/route.ts';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('sendTelegramNotification')) {
  content = content.replace(
    'import { createClient } from "@/lib/supabase-server";',
    'import { createClient } from "@/lib/supabase-server";\nimport { sendTelegramNotification } from "@/lib/telegram";'
  );
}

const target = `    if (updateError) {
      throw updateError;
    }`;

const replacement = `    if (updateError) {
      throw updateError;
    }

    try {
      const escapeHtml = (unsafe) => (unsafe || "").toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
      if (action === "approve") {
        await sendTelegramNotification(\`✅ <b>Karya Disetujui Admin</b>\\n\\n📌 <b>ID:</b> \${id}\\n\\nKarya telah disetujui dan dipublikasikan oleh Admin.\`);
      } else if (action === "reject") {
        await sendTelegramNotification(\`❌ <b>Karya Ditolak Admin</b>\\n\\n📌 <b>ID:</b> \${id}\\n💬 <b>Alasan:</b> <i>\${escapeHtml(reason)}</i>\`);
      } else if (action === "delete") {
        await sendTelegramNotification(\`🗑️ <b>Karya Dihapus Admin</b>\\n\\n📌 <b>ID:</b> \${id}\`);
      }
    } catch (e) {
      console.error("Gagal kirim notif telegram admin:", e);
    }`;

if (content.includes(target) && !content.includes('Karya Disetujui Admin')) {
  content = content.replace(target, replacement);
  fs.writeFileSync(file, content);
  console.log("Patched moderate-post/route.ts");
} else {
  console.log("Target not found or already patched");
}
