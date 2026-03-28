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
      
      // Capture exact OpenAI error message and display it on the dashboard
      if (data.error) {
        const reason = data.error.message || data.error.code || "Unknown API Error";
        console.error("OpenAI API Error:", reason);
        return {
          score: 0.0,
          reviewText: `⚠️ OpenAI Error: ${reason}`,
          amends: `DIAGNOSTIC: ${reason}. Check your OpenAI Billing at platform.openai.com/settings/organization/billing`
        };
      }

      const aiResult = JSON.parse(data.choices[0].message.content);

      return {
        score: aiResult.score,
        reviewText: `${aiResult.review}`,
        amends: aiResult.amends.join('\n\n')
      };
    } catch (error: any) {
      console.error("Network/Parse Error:", error);
      return {
        score: 0.0,
        reviewText: `⚠️ Network Error: ${error.message || "Could not reach OpenAI"}`,
        amends: "DIAGNOSTIC: Network connection to OpenAI failed. Check Vercel function logs."
      };
    }
  } else {
    return {
      score: 1.0,
      reviewText: "🚨 SECURITY ALERT: OPENAI_API_KEY missing from Vercel Variables.",
      amends: "1. Go to Vercel Settings.\n2. Add OPENAI_API_KEY.\n3. REDEPLOY the project."
    };
  }
}

