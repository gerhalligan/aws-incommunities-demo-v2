import { supabase } from "@/integrations/supabase/client";

const SETTINGS_TABLE = 'user_settings';

interface UserSettings {
  openaiApiKey?: string;
  [key: string]: any;
}

const DEFAULT_SETTINGS: UserSettings = {};

export const loadUserSettings = async (): Promise<UserSettings> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  // First check if settings exist
  const { count, error: countError } = await supabase
    .from(SETTINGS_TABLE)
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  if (countError) throw countError;

  // If no settings exist, create default settings
  if (count === 0) {
    const { error: insertError } = await supabase
      .from(SETTINGS_TABLE)
      .insert({
        user_id: user.id,
        settings: DEFAULT_SETTINGS
      });

    if (insertError) throw insertError;
    return DEFAULT_SETTINGS;
  }

  // Load existing settings
  const { data, error: loadError } = await supabase
    .from(SETTINGS_TABLE)
    .select("settings")
    .eq("user_id", user.id)
    .single();

  if (loadError) throw loadError;
  if (!data?.settings) return DEFAULT_SETTINGS;

  return data.settings;
};

export const saveUserSettings = async (settings: UserSettings): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { error } = await supabase
    .from(SETTINGS_TABLE)
    .upsert({
      user_id: user.id,
      settings
    }, {
      onConflict: 'user_id'
    });

  if (error) throw error;
};