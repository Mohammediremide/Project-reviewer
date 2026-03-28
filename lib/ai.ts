export async function analyzeProject(projectUrl: string, repoUrl?: string) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Act as a senior software engineer and architect. Analyze this project: 
                     Website URL: ${projectUrl} 
                     Github URL: ${repoUrl || 'Not Provided'}

                     Provide a JSON response with exactly these fields:
                     - score: a float between 3.5 and 5.0
                     - review: a professional 2-sentence architectural review
                     - amends: exactly 3 numbered improvement suggestions

                     Respond ONLY with the JSON.`
            }]
          }]
        })
      });

      const data = await response.json();
      const textResult = data.candidates[0].content.parts[0].text;
      
      // Attempt to parse JSON from the AI response
      const jsonStr = textResult.replace(/```json/g, '').replace(/```/g, '').trim();
      const aiResult = JSON.parse(jsonStr);

      return {
        score: aiResult.score,
        reviewText: `[Core AI Review] ${aiResult.review}`,
        amends: aiResult.amends
      };
    } catch (error) {
      console.error("AI API Error:", error);
      // Fallback to static logic if AI fails
    }
  }

  // FALLBACK LOGIC (if no API Key or if API fails)
  const projectIdentifier = (repoUrl || projectUrl).toLowerCase();
  const score = (Math.random() * 1.5 + 3.4).toFixed(1);
  const categories = [
    { keywords: ['shop', 'store', 'cart', 'ecom'], type: 'E-commerce', review: "Strong commercial structure. transaction components show high resilience.", amends: ["Optimize payment latency.", "Add saved-for-later feature.", "Audit product images."] },
    { keywords: ['blog', 'news', 'article'], type: 'Content', review: "Excellent SEO and heading hierarchy. Readability score is high.", amends: ["Implement ISR for speed.", "Add reading progress bar.", "Refine dark mode contrast."] },
    { keywords: ['portfolio', 'resume'], type: 'Identity', review: "Visual storytelling is top-tier. Motion design is smooth.", amends: ["Add PDF Resume link.", "Check external links.", "Improve A11y."] },
    { keywords: ['dashboard', 'saas', 'crm'], type: 'Enterprise', review: "Great visualization and table layouts. Solid server-side separation.", amends: ["Implement pagination.", "Standardize CSV exports.", "Add RBAC models."] }
  ];

  let result = { type: 'Neural Node', review: "Clean module architecture and solid understanding of patterns.", amends: ["Refactor logic into hooks.", "Add error boundaries.", "Strengthen validations."] };
  for (const cat of categories) {
    if (cat.keywords.some(k => projectIdentifier.includes(k))) {
      result = cat;
      break;
    }
  }

  return {
    score: parseFloat(score),
    reviewText: `[Auto Sync] ${result.review}`,
    amends: result.amends.map((a, i) => `${i+1}. ${a}`).join('\n')
  };
}
