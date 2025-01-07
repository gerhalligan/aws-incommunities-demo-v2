import { loadUserSettings } from '../settings';
import { supabase } from '@/integrations/supabase/client';
import { getAnswer, saveAnswer } from '../answers';
import { generateOpenAIResponse } from './openai';
import { generatePerplexityResponse } from './perplexity';
import type { BranchContext } from '@/types/answers';

export const generateAIResponse = async (
  prompt: string, 
  questionId?: number, 
  currentAnswer?: string | { value: string },
  branchContext?: BranchContext,
  buttonId?: string
): Promise<string> => {
  try {
    // If we have questionId and currentAnswer, check if we need a new response
    if (questionId !== undefined && currentAnswer && buttonId) {
      const existingAnswer = await getAnswer(
        (await supabase.auth.getUser()).data.user.id,
        questionId,
        branchContext
      );

      const existingButtonResponse = existingAnswer?.buttonResponses?.[buttonId];
      const existingValue = existingAnswer?.value;
      const currentValue = typeof currentAnswer === 'string' ? currentAnswer : currentAnswer.value;
      
      // Return existing response if we have one and the answer hasn't changed
      if (existingButtonResponse && existingValue === currentValue) {
        return existingButtonResponse;
      }
    }

    // Only proceed with API call if we need a new response
    const settings = await loadUserSettings();
    const provider = settings.ai?.provider || 'openai';
    const apiKey = provider === 'openai' ? settings.ai?.openaiApiKey : settings.ai?.perplexityApiKey;
    
    if (!apiKey) {
      throw new Error(`${provider === 'openai' ? 'OpenAI' : 'Perplexity'} API key not found. Please set it in the Settings page.`);
    }

    // Generate AI response
    const response = provider === 'openai' 
      ? await generateOpenAIResponse(prompt, apiKey)
      : await generatePerplexityResponse(prompt, apiKey);

    // Save the response if needed
    if (questionId !== undefined && currentAnswer) {
       try {
        const answerData = {
          ...currentAnswer,
          buttonResponses: buttonId ? {
            [buttonId]: response
          } : undefined,
          aiAnalysis: buttonId ? undefined : response
        };

        await saveAnswer(questionId, answerData, response, false, branchContext);
      } catch (error) {
        console.error('Error saving AI analysis:', error);
      }
    }

    return response;
  } catch (error) {
    console.error('Error in generateAIResponse:', error);
    throw error;
  }
};
