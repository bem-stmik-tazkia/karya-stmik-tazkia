import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/supabase-server'; // Let's check how they do auth later, wait, I shouldn't guess.

export function useUnreadMessages(userId: string | undefined) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    // Fetch initial count
    const fetchUnreadCount = async () => {
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false)
        .neq('sender_id', userId);

      if (!error && count !== null) {
        setUnreadCount(count);
      }
    };

    fetchUnreadCount();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('unread_messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          // If a new message is inserted and it's not from us, increment count
          if (payload.eventType === 'INSERT' && payload.new.sender_id !== userId && !payload.new.is_read) {
            setUnreadCount((prev) => prev + 1);
          }
          // If a message is updated (e.g., read), decrement count
          if (payload.eventType === 'UPDATE') {
            if (payload.old.is_read === false && payload.new.is_read === true && payload.new.sender_id !== userId) {
              setUnreadCount((prev) => Math.max(0, prev - 1));
            }
          }
          // Note: In a more complex setup, you might want to refetch count to be 100% accurate 
          // if there are many concurrent updates, but this optimistic approach works well.
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return unreadCount;
}
