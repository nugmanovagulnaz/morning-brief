const Anthropic = require('@anthropic-ai/sdk');
const { getNewsBriefPrompt } = require('../config/prompt');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function getNewsBrief() {
  const prompt = getNewsBriefPrompt();

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    tools: [{ type: 'web_search_20250305', name: 'web_search' }],
    messages: [{ role: 'user', content: prompt }],
  });

  // Extract all text blocks from the response (tool results + final answer)
  const textBlocks = response.content.filter((b) => b.type === 'text');
  const text = textBlocks.map((b) => b.text).join('\n').trim();

  return `📰 <b>Health Tech News</b>\n${text}`;
}

module.exports = { getNewsBrief };
