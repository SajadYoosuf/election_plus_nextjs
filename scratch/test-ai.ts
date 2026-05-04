import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function testAI() {
  try {
    console.log('Testing AI with key:', process.env.GOOGLE_GENERATION_AI_API_KEY?.slice(0, 5) + '...');
    const { text } = await generateText({
      model: google('gemini-1.5-flash'),
      prompt: 'Hello, are you working?',
    });
    console.log('AI Response:', text);
  } catch (error: any) {
    console.error('AI Test Failed:', error.message);
  }
}

testAI();
