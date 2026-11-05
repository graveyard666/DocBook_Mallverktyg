import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface SavedMessageSummary {
  id: string;
  name: string;
  updated_at: string;
}

export interface SavedMessageContent {
  name: string;
  xml: string;
}

const LIST_ERROR = 'Kunde inte hämta de sparade meddelandena.';
const SAVE_ERROR = 'Kunde inte spara meddelandet. Försök igen.';
const LOAD_ERROR = 'Kunde inte öppna det sparade meddelandet.';
const DELETE_ERROR = 'Kunde inte ta bort meddelandet.';

export function useSavedMessages() {
  const [messages, setMessages] = useState<SavedMessageSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const { data, error: listError } = await supabase
      .from('saved_messages')
      .select('id, name, updated_at')
      .order('updated_at', { ascending: false });
    if (listError || !data) {
      setError(LIST_ERROR);
    } else {
      setMessages(data);
      setError(null);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const save = useCallback(
    async (name: string, xml: string, existingId: string | null): Promise<string> => {
      if (existingId) {
        const { error: updateError } = await supabase
          .from('saved_messages')
          .update({ name, xml, updated_at: new Date().toISOString() })
          .eq('id', existingId);
        if (updateError) throw new Error(SAVE_ERROR);
        await refresh();
        return existingId;
      }
      const { data, error: insertError } = await supabase
        .from('saved_messages')
        .insert({ name, xml })
        .select('id')
        .single();
      if (insertError || !data) throw new Error(SAVE_ERROR);
      await refresh();
      return data.id;
    },
    [refresh]
  );

  const load = useCallback(async (id: string): Promise<SavedMessageContent> => {
    const { data, error: loadError } = await supabase
      .from('saved_messages')
      .select('name, xml')
      .eq('id', id)
      .maybeSingle();
    if (loadError || !data) throw new Error(LOAD_ERROR);
    return data;
  }, []);

  const remove = useCallback(
    async (id: string) => {
      const { error: deleteError } = await supabase.from('saved_messages').delete().eq('id', id);
      if (deleteError) throw new Error(DELETE_ERROR);
      await refresh();
    },
    [refresh]
  );

  return { messages, isLoading, error, save, load, remove };
}
