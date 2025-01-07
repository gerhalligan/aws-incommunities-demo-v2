import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { loadUserSettings, saveUserSettings } from "@/services/settings";
import type { AIProvider } from "@/types/settings";

const Settings = () => {
  const [openaiApiKey, setOpenaiApiKey] = useState("");
  const [perplexityApiKey, setPerplexityApiKey] = useState("");
  const [aiProvider, setAiProvider] = useState<AIProvider>("openai");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await loadUserSettings();
        if (settings.ai) {
          setAiProvider(settings.ai.provider || 'openai');
          setOpenaiApiKey(settings.ai.openaiApiKey || '');
          setPerplexityApiKey(settings.ai.perplexityApiKey || '');
        }
      } catch (error) {
        console.error("Error loading settings:", error);
        toast({
          title: "Error",
          description: "Failed to load settings",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [toast]);

  const handleSaveSettings = useCallback(async () => {
    try {
      await saveUserSettings({
        ai: {
          provider: aiProvider,
          openaiApiKey,
          perplexityApiKey
        }
      });
      toast({
        title: "Settings Saved",
        description: "Your AI settings have been saved successfully.",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    }
  }, [aiProvider, openaiApiKey, perplexityApiKey, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>
        
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-6">AI Integration</h2>
          
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-4">Loading...</div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>AI Provider</Label>
                  <Select value={aiProvider} onValueChange={(value: AIProvider) => setAiProvider(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select AI provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="perplexity">Perplexity AI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 mt-4">
                  <Label htmlFor="openaiApiKey">OpenAI API Key</Label>
                  <Input
                    id="openaiApiKey"
                    type="password"
                    value={openaiApiKey}
                    onChange={(e) => setOpenaiApiKey(e.target.value)}
                    placeholder="Enter your OpenAI API key"
                    className="w-full"
                  />
                </div>

                <div className="space-y-2 mt-4">
                  <Label htmlFor="perplexityApiKey">Perplexity API Key</Label>
                  <Input
                    id="perplexityApiKey"
                    type="password"
                    value={perplexityApiKey}
                    onChange={(e) => setPerplexityApiKey(e.target.value)}
                    placeholder="Enter your Perplexity API key"
                    className="w-full"
                  />
                </div>

                <p className="text-sm text-gray-500 mt-2">
                  Your API keys will be used for AI-powered features. Keep them secret!
                </p>

                <Button onClick={handleSaveSettings} className="w-full mt-6">
                  Save Settings
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;