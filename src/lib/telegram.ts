import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const sendTelegramNotification = async (message: string) => {
  let token = process.env.TELEGRAM_BOT_TOKEN;
  let chatId = process.env.TELEGRAM_CHAT_ID;

  try {
    const { data } = await supabase
      .from('system_settings')
      .select('key, value')
      .in('key', ['telegram_bot_token', 'telegram_chat_id']);
      
    if (data) {
      const dbToken = data.find(d => d.key === 'telegram_bot_token')?.value;
      const dbChatId = data.find(d => d.key === 'telegram_chat_id')?.value;
      if (dbToken && dbToken !== 'null' && dbToken.trim() !== '') token = dbToken;
      if (dbChatId && dbChatId !== 'null' && dbChatId.trim() !== '') chatId = dbChatId;
    }
  } catch (e) {
    console.error("Gagal mengambil setting telegram dari DB:", e);
  }

  if (!token || !chatId) {
    console.warn("Telegram Bot Token atau Chat ID belum diset.");
    return;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
      }),
    });

    if (!response.ok) {
      console.error("Gagal mengirim Telegram", await response.text());
    }
  } catch (error) {
    console.error("Telegram error:", error);
  }
};
