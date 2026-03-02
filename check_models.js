import fetch from 'node-fetch';

async function listModels(apiKey) {
  if (!apiKey) {
    console.error("Please provide an API Key as an argument: node check_models.js YOUR_API_KEY");
    return;
  }
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    if (data.models) {
      console.log("Available Models:");
      data.models.forEach(m => console.log(`- ${m.name} (${m.displayName})`));
    } else {
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

const apiKey = process.argv[2];
listModels(apiKey);
