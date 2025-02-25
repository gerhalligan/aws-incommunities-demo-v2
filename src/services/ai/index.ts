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
  forceRefresh?: boolean;
}

export const generateAIResponse = async (
  prompt: string, 
  context?: AIContext
): Promise<string> => {
  try {
    const { questionId, currentAnswer, branchContext, buttonId, applicationId, forceRefresh } = context || {};
    
    if (!applicationId) {
      throw new Error('Application ID is required for AI analysis');
    }

    // Process date-related merge tags
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    
    prompt = prompt
      .replace(/{{currentYear}}/g, currentYear.toString())
      .replace(/{{currentDate}}/g, currentDate.toISOString().split('T')[0])
      .replace(/{{previousYear}}/g, (currentYear - 1).toString())
      .replace(/{{nextYear}}/g, (currentYear + 1).toString());

    // Validate that we have a non-empty prompt after replacements
    if (!prompt.trim()) {
      throw new Error('The generated prompt is empty after processing merge tags. Please check your prompt template.');
    }

    // If we have questionId and currentAnswer, check if we need a new response
    if (questionId !== undefined && currentAnswer && buttonId) {
        // Skip cache check if forceRefresh is true
      if (forceRefresh) {
        console.log('Force refresh requested, skipping cache check');
      } else {
          const existingAnswer = await getAnswer(
            (await supabase.auth.getUser()).data.user.id,
            questionId,
            branchContext,
            applicationId
          );
    
          const existingButtonResponse = existingAnswer?.aiAnalysis?.buttonResponses?.[buttonId];
          const existingValue = existingAnswer?.value;
          const lastAnalysisTimestamp = existingAnswer?.aiAnalysis?.lastUpdated;
        
          // Return existing response if we have one and it was generated after the last answer update
          if (existingButtonResponse) {
            
            const existingAnswerData = {
              value: existingValue || '',
              aiAnalysis: {
                analysis: existingButtonResponse,
                buttonResponses: {
                  ...(existingAnswer?.aiAnalysis?.buttonResponses || {})
                }, 
                lastUpdated: lastAnalysisTimestamp
              },
            };
          
            return existingAnswerData;
        }
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
                  [buttonId]: response
                }
                : currentAnswer?.aiAnalysis?.buttonResponses || {},
            lastUpdated: new Date().toISOString()
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