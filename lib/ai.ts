export async function analyzeProject(projectUrl: string, repoUrl?: string) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return {
      score: 1.0,
      reviewText: "🚨 GROQ_API_KEY is missing from your Vercel Environment Variables.",
      amends: "1. Go to Vercel → Settings → Environment Variables.\n2. Add GROQ_API_KEY.\n3. Redeploy."
    };
  }

  // Fetch real project context from GitHub API
  let projectContext = "";
  if (repoUrl && repoUrl.includes("github.com")) {
    try {
      const parts = repoUrl.replace("https://github.com/", "").split("/");
      const owner = parts[0];
      const repo = parts[1];
      if (owner && repo) {
        // Fetch README content
        const readmeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
          headers: { Accept: "application/vnd.github.v3.raw" }
        });
        if (readmeRes.ok) {
          const readme = await readmeRes.text();
          projectContext = `\n\nGitHub README:\n${readme.substring(0, 2000)}`;
        }

        // Fetch repo metadata (language, topics, description)
        const metaRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
        if (metaRes.ok) {
          const meta = await metaRes.json();
          projectContext += `\n\nRepo Info: Language: ${meta.language || 'Unknown'}, Stars: ${meta.stargazers_count}, Description: ${meta.description || 'None'}, Topics: ${(meta.topics || []).join(', ')}`;
        }
      }
    } catch (e) {
      console.warn("Could not fetch GitHub metadata:", e);
    }
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
            content: "You are a brutal, honest Lead Software Architect reviewer. You do NOT give charity scores. You evaluate projects strictly on real engineering quality. Always respond ONLY with a valid JSON object, no extra text."
          },
          {
            role: "user",
            content: `Perform a BRUTALLY HONEST, critical architecture audit on this specific project:

Website URL: ${projectUrl}
GitHub Repo: ${repoUrl || 'Not Provided'}
${projectContext}

Score STRICTLY using this honest scale (use the FULL range, do not inflate):
- 1.0-1.9: Very poor. Broken, insecure, or fundamentally flawed.
- 2.0-2.9: Below average. Works but has major flaws in architecture, security, or performance.
- 3.0-3.5: Average. Functional but lacks best practices, optimization, or scalability.
- 3.6-4.2: Good. Solid foundation, minor issues.
- 4.3-4.7: Very good. Production-ready with strong engineering patterns.
- 4.8-5.0: Exceptional. World-class engineering only. Very rare.

Return ONLY a valid JSON object:
{
  "score": <honest float from 1.0 to 5.0, no inflation>,
  "review": "<4 honest sentences: what the project does, specific real strengths noticed, specific real weaknesses or concerns, and an honest overall verdict>",
  "amends": [
    "<Real issue 1 specific to THIS project: WHAT the actual problem is, WHY it matters, HOW to fix it with exact tools or steps>",
    "<Real issue 2 specific to THIS project: WHAT the actual problem is, WHY it matters, HOW to fix it with exact tools or steps>",
    "<Real issue 3 specific to THIS project: WHAT the actual problem is, WHY it matters, HOW to fix it with exact tools or steps>"
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
        amends: `Check your GROQ_API_KEY in Vercel at console.groq.com`
      };
    }

    const aiResult = JSON.parse(data.choices[0].message.content);

    // Filter out empty amends
    const cleanAmends = Array.isArray(aiResult.amends)
      ? aiResult.amends
          .filter((a: string) => a && a.trim().length > 0)
          .map((a: string, i: number) => `${i + 1}. ${a}`)
          .join('\n\n')
      : String(aiResult.amends);

    return {
      score: Number(aiResult.score) || 4.0,
      reviewText: aiResult.review,
      amends: cleanAmends
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

export async function analyzeItem(type: string, description: string, imageUrl?: string) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return {
      score: 1.0,
      reviewText: "🚨 GROQ_API_KEY is missing.",
      amends: "Check your environment variables."
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
        model: imageUrl ? "llama-3.2-11b-vision-preview" : "llama-3.3-70b-versatile",
        temperature: 0.8,
        messages: [
          {
            role: "system",
            content: `You are a style and gadget trendsetter reviewer. You are brutally honest, funny, and slightly arrogant about your taste. You rate things out of 5 based on aesthetics, practicality, and "vibe". Return ONLY a valid JSON object.`
          },
          {
            role: "user",
            content: imageUrl ? [
              { type: "text", text: `Rate this ${type === 'setup' ? 'desk setup and workspace ergonomics' : type}. Description: ${description}. Be brutally honest, witty, and helpful. Scale 1-5.` },
              { type: "image_url", image_url: { url: imageUrl } }
            ] : `Rate this ${type}. Description: ${description}. Be brutally honest, witty, and helpful. Scale 1-5.
            
            Return ONLY a valid JSON object:
            {
              "score": <float 1.0-5.0>,
              "review": "<Brutally honest review>",
              "tips": ["Tip 1", "Tip 2", "Tip 3"]
            }`
          }
        ],
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    const aiResult = JSON.parse(data.choices[0].message.content);

    return {
      score: Number(aiResult.score) || 3.0,
      reviewText: aiResult.review,
      amends: Array.isArray(aiResult.tips) ? aiResult.tips.join('\n\n') : String(aiResult.tips)
    };

  } catch (error: any) {
    console.error("Groq Rating Error:", error);
    return {
      score: 0,
      reviewText: `Rating failed: ${error.message}`,
      amends: "Try again later."
    };
  }
}
