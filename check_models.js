import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('AIzaSyBz4Bv4Yfkp5w0ouNx8V5zuyJRfrihDsQU');

async function listModels() {
  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyBz4Bv4Yfkp5w0ouNx8V5zuyJRfrihDsQU');
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

listModels();
