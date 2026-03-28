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
    } catch (error) {
      console.error("OpenAI Connection Failed:", error);
    }
  } else {
    console.warn("OPENAI_API_KEY NOT FOUND. Falling back to static simulation.");
  }

  // FALLBACK LOGIC
  const projectIdentifier = (repoUrl || projectUrl).toLowerCase();
  const score = (Math.random() * 1.5 + 3.4).toFixed(1);
  const categories = [
    { keywords: ['shop', 'store'], review: "Strong commercial structure. Transaction components show high resilience.", amends: ["Optimize payment latency.", "Add saved-for-later feature."] },
    { keywords: ['blog', 'article'], review: "Excellent SEO and heading hierarchy. Readability score is high.", amends: ["Implement ISR for speed.", "Add reading progress bar."] },
    { keywords: ['portfolio', 'resume'], review: "Visual storytelling is top-tier. Motion design is smooth.", amends: ["Add PDF Resume link.", "Check external links."] },
    { keywords: ['dashboard', 'saas'], review: "Great visualization and table layouts. Solid server-side separation.", amends: ["Implement pagination.", "Standardize CSV exports."] }
  ];

  let result = { review: "Clean module architecture and solid understanding of patterns.", amends: ["Refactor logic into hooks.", "Add error boundaries."] };
  for (const cat of categories) { if (cat.keywords.some(k => projectIdentifier.includes(k))) { result = cat; break; } }

  return {
    score: parseFloat(score),
    reviewText: `[STATIC FALLBACK] ${result.review}`,
    amends: result.amends.map((a, i) => `${i+1}. ${a}`).join('\n')
  };
}
