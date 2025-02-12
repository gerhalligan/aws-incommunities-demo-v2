import { loadUserSettings } from '../settings';
import { supabase } from '@/integrations/supabase/client';
import { getAnswer, saveAnswer } from '../answers';
import { generateOpenAIResponse } from './openai';
import { generatePerplexityResponse } from './perplexity';
import type { BranchContext } from '@/types/answers';

interface AIContext {
  questionId?: number;
  currentAnswer?: string | { value: string };
  branchContext?: BranchContext;
  buttonId?: string;
  applicationId?: string;
}

export const generateAIResponse = async (
  prompt: string, 
  context?: AIContext
): Promise<string> => {
  try {
    const { questionId, currentAnswer, branchContext, buttonId, applicationId } = context || {};
    
    if (!applicationId) {
      throw new Error('Application ID is required for AI analysis');
    }

    // If we have questionId and currentAnswer, check if we need a new response
    if (questionId !== undefined && currentAnswer && buttonId) {
      const existingAnswer = await getAnswer(
        (await supabase.auth.getUser()).data.user.id,
        questionId,
        branchContext,
        applicationId
      );

      const existingButtonResponse = existingAnswer?.aiAnalysis?.buttonResponses?.[buttonId];
      const existingValue = existingAnswer?.value;
      const currentValue = typeof currentAnswer === 'string' ? currentAnswer : currentAnswer.value;
      
      // Return existing response if we have one and the answer hasn't changed
      if (existingButtonResponse && existingValue === currentValue) {
        const existingAnswerData = {
          value: existingValue || '',
          aiAnalysis: {
            analysis: existingButtonResponse,
            buttonResponses: {
              ...(existingAnswer?.aiAnalysis?.buttonResponses || {})
            },
          },
        };
      
        return existingAnswerData;
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
          value: typeof currentAnswer === 'string' ? currentAnswer : currentAnswer?.value || '',
          aiAnalysis: {
            analysis: response,
            buttonResponses: buttonId
              ? {
                  ...(currentAnswer?.aiAnalysis?.buttonResponses || {}),
                  [buttonId]: response,
                }
              : currentAnswer?.aiAnalysis?.buttonResponses || {},
          },
        };
         
        console.log('generateAIResponse.answerData', answerData);

        await saveAnswer(questionId, answerData, response, false, branchContext, applicationId);
      } catch (error) {
        console.error('Error saving AI analysis:', error);
        throw error;
      }
    }

    return response;
  } catch (error) {
    console.error('Error in generateAIResponse:', error);
    throw error;
  }
};