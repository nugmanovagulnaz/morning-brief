const getDate = () =>
  new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Europe/London',
  });

module.exports = {
  getNewsBriefPrompt: () =>
    `Today is ${getDate()}. You are a health technology news analyst. Search the web for the top 3–5 health tech stories published in the last 24–48 hours. Cover areas such as: medical AI, digital health platforms, NHS technology, wearables, genomics, telemedicine, and health data / privacy. For each story write one sentence summarising what happened and one sentence on why it matters. Keep the entire response under 400 words. Format as a bullet list with each story on its own bullet. No intro or outro text — bullets only.`,
};
