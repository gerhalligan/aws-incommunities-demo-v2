// Environment variables with fallbacks
export const ENV = {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || "https://covtndmhchzkzcedldxm.supabase.co",
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvdnRuZG1oY2h6a3pjZWRsZHhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU5MTEzMjIsImV4cCI6MjA1MTQ4NzMyMn0.pAyHKM5qYyuZQsh71bl6WHfIc6_zvtqtzf-R_Vb9_VE",
  VITE_MAPBOX_TOKEN: import.meta.env.VITE_MAPBOX_TOKEN || "pk.eyJ1IjoiZ2VyaGFsbGlnYW4iLCJhIjoiY201a3hxZ2QwMG1rbTJqc2NleGh0MjJzMSJ9.gBMmfZ-z19On4bFGAIiBrg"
};