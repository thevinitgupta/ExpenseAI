export interface ExpenseData {
    dateSpent: string;
    amountSpent: number;
    spentOn: string;
    spentThrough: string;
    selfOrOthersIncluded: string;
    paidTo?: string;
  }
  
  export async function parseExpenseWithGemini(
    transcript: string,
  ): Promise<ExpenseData> {
    const prompt = `Parse the following expense description and extract structured data. Respond ONLY with a JSON object, no markdown or preamble.
  
  Transcript: "${transcript}"
  
  Extract:
  - dateSpent (YYYY-MM-DD format, use today if not specified: ${new Date().toISOString().split('T')[0]})
  - amountSpent (number only, no currency symbols)
  - spentOn (category: Food, Travel, Shopping, Bills, Entertainment, or Other)
  - spentThrough (Cash, UPI, or Card)
  - selfOrOthersIncluded (Self or Others)
  - paidTo (optional, name of person or entity if mentioned, otherwise Others)
  
  Example response:
  {
    "dateSpent": "2024-11-27",
    "amountSpent": 450,
    "spentOn": "Food",
    "spentThrough": "UPI",
    "selfOrOthersIncluded": "Self"
  }`;
  
    const response = await fetch(
      "/api/gemini",
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );
  
    if (!response.ok) {
      throw new Error('Failed to call Gemini API');
    }
  
    const data = await response.json();
    console.log('Gemini response data:', data);
    const text = data.candidates[0].content.parts[0].text;
    
    // Remove markdown code blocks if present
    const cleanJson = text.replace(/```json\n?|\n?```/g, '').trim();
    
    return JSON.parse(cleanJson);
  }