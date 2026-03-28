export async function analyzeProject(projectUrl: string, repoUrl?: string) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey) {
    console.log("Initiating OpenAI Technical Audit [GPT-4o-mini]...");
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{
            role: "system",
            content: "You are a world-renowned Lead Software Architect. Provide deep, expansive technical audits. Always respond in valid JSON format."
          }, {
            role: "user",
            content: `Perform an exhaustive architecture audit on this project: 
                     Website: ${projectUrl} 
                     Github: ${repoUrl || 'Not Provided'}

                     Return a JSON object with:
                     - score: a float (3.5 - 5.0)
                     - review: a detailed 4-sentence technical review.
                     - amends: array of exactly 3 highly detailed, expansive improvement suggestions. Explain the What, Why, and precise How for each fix.`
          }],
          response_format: { type: "json_object" }
        })
      });

      const data = await response.json();
      
      if (data.error) {
        console.error("OpenAI Internal Error:", data.error.message);
        throw new Error(data.error.message);
      }

      const aiResult = JSON.parse(data.choices[0].message.content);

      return {
        score: aiResult.score,
        reviewText: `${aiResult.review}`,
        amends: aiResult.amends.join('\n\n')
      };
    } catch (error: any) {
      console.error("OpenAI Connection Failed:", error);
      return {
        score: 0.0,
        reviewText: "⚠️ AI ARCHITECT OFFLINE: Connection to OpenAI failed. Check Vercel logs.",
        amends: "SYSTEM ERROR: API connection timed out or rejected."
      };
    }
  } else {
    console.warn("OPENAI_API_KEY NOT FOUND.");
    return {
      score: 1.0,
      reviewText: "🚨 SECURITY ALERT: OPENAI_API_KEY is missing from Vercel Environment Variables. The engine is running on static dummy data.",
      amends: "1. Go to Vercel Settings.\n2. Add OPENAI_API_KEY.\n3. REDEPLOY the project."
    };
  }
}

