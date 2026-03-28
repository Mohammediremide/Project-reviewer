export async function analyzeProject(projectUrl: string, repoUrl?: string) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    console.warn("GROQ_API_KEY not found in environment.");
    return {
      score: 1.0,
      reviewText: "🚨 GROQ_API_KEY is missing from your Vercel Environment Variables.",
      amends: "1. Go to Vercel → Settings → Environment Variables.\n2. Add GROQ_API_KEY.\n3. Redeploy."
    };
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content: "You are a world-class Lead Software Architect with 20 years of experience. Provide extremely detailed, expansive technical audits. Always respond in valid JSON format only. No markdown, no extra text."
          },
          {
            role: "user",
            content: `Perform an exhaustive architecture audit on this project:
Website URL: ${projectUrl}
GitHub Repo: ${repoUrl || 'Not Provided'}

Return ONLY a valid JSON object with exactly these fields:
{
  "score": <a float between 3.5 and 5.0>,
  "review": "<4 detailed sentences covering: architecture quality, code structure, performance, and security posture of this specific project>",
  "amends": [
    "<Improvement 1: WHAT to fix, WHY it matters for this project, precise HOW steps>",
    "<Improvement 2: WHAT to fix, WHY it matters for this project, precise HOW steps>",
    "<Improvement 3: WHAT to fix, WHY it matters for this project, precise HOW steps>"
  ]
}`
          }
        ],
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();

    if (data.error) {
      const reason = data.error.message || data.error.code || "Unknown Groq API Error";
      console.error("Groq API Error:", reason);
      return {
        score: 3.5,
        reviewText: `⚠️ Groq API Error: ${reason}`,
        amends: `Check your GROQ_API_KEY in Vercel and ensure it has not expired at console.groq.com`
      };
    }

    const aiResult = JSON.parse(data.choices[0].message.content);

    return {
      score: Number(aiResult.score) || 4.0,
      reviewText: aiResult.review,
      amends: Array.isArray(aiResult.amends)
        ? aiResult.amends.map((a: string, i: number) => `${i + 1}. ${a}`).join('\n\n')
        : String(aiResult.amends)
    };

  } catch (error: any) {
    console.error("Groq Network Error:", error);
    return {
      score: 3.5,
      reviewText: `⚠️ Network Error: ${error.message}`,
      amends: "Check Vercel function logs for the full error trace."
    };
  }
}
