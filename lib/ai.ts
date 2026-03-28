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
            content: "You are a world-class Lead Software Architect. Analyze real projects and give highly specific, targeted technical feedback. Always respond ONLY with a valid JSON object, no extra text."
          },
          {
            role: "user",
            content: `Analyze this specific project and give targeted, project-specific feedback:

Website URL: ${projectUrl}
GitHub Repo: ${repoUrl || 'Not Provided'}
${projectContext}

Based on the actual project above, return a JSON object:
{
  "score": <float between 3.5 and 5.0 based on real quality>,
  "review": "<4 sentences specific to THIS project: what it does, its architecture strengths, code quality observations, and real concerns you notice>",
  "amends": [
    "<Specific fix 1 for THIS project: WHAT the specific issue is, WHY it hurts this project, exact HOW to fix it with tool/library names>",
    "<Specific fix 2 for THIS project: WHAT the specific issue is, WHY it hurts this project, exact HOW to fix it with tool/library names>",
    "<Specific fix 3 for THIS project: WHAT the specific issue is, WHY it hurts this project, exact HOW to fix it with tool/library names>"
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
