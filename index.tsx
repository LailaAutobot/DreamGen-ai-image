/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { GoogleGenAI, GenerateImagesResponse } from "@google/genai";

// --- DOM Elements ---
const generateForm = document.getElementById('generate-form') as HTMLFormElement;
const promptInput = document.getElementById('prompt-input') as HTMLInputElement;
const generatedImage = document.getElementById('generated-image') as HTMLImageElement;
const imagePlaceholder = document.getElementById('image-placeholder') as HTMLParagraphElement;
const loader = document.getElementById('loader') as HTMLDivElement;
const errorContainer = document.getElementById('error-container') as HTMLDivElement;
const imageContainer = document.getElementById('image-container') as HTMLDivElement;
const resolutionSelector = document.getElementById('resolution-selector') as HTMLDivElement;


// --- State and Constants ---
let ai: GoogleGenAI;

/**
 * Initializes the application.
 */
function init() {
  if (!process.env.API_KEY) {
    handleError('API_KEY is missing. Please ensure it is configured correctly.');
    return;
  }
  ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  generateForm.addEventListener('submit', handleGeneration);
  resolutionSelector.addEventListener('click', handleResolutionChange);
  // Set initial aspect ratio class
  imageContainer.classList.add('aspect-1-1');
}

/**
 * Handles clicks on the resolution selector buttons.
 * @param event The click event.
 */
function handleResolutionChange(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.matches('.resolution-btn')) return;

    // Update active state on buttons
    resolutionSelector.querySelectorAll('.resolution-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
    });
    target.classList.add('active');
    target.setAttribute('aria-pressed', 'true');

    const aspectRatio = target.dataset.aspectRatio;

    // Update image container aspect ratio class
    imageContainer.classList.remove('aspect-1-1', 'aspect-16-9', 'aspect-9-16');
    if (aspectRatio === '1:1') {
        imageContainer.classList.add('aspect-1-1');
    } else if (aspectRatio === '16:9') {
        imageContainer.classList.add('aspect-16-9');
    } else if (aspectRatio === '9:16') {
        imageContainer.classList.add('aspect-9-16');
    }
}


/**
 * Handles the generate form submission.
 * @param event The form submission event.
 */
async function handleGeneration(event: SubmitEvent) {
  event.preventDefault();
  const prompt = promptInput.value.trim();
  if (!prompt) return;

  setLoading(true);
  clearError();

  try {
    const response: GenerateImagesResponse = await ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: prompt,
        config: {numberOfImages: 1, outputMimeType: 'image/jpeg'},
    });
    
    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
    displayImage(imageUrl);

  } catch (error) {
    console.error(error);
    handleError('Sorry, an error occurred while generating the image. Please try again.');
  } finally {
    setLoading(false);
  }
}

/**
 * Displays the generated image.
 * @param imageUrl The data URL of the image to display.
 */
function displayImage(imageUrl: string) {
    generatedImage.src = imageUrl;
    generatedImage.classList.add('visible');
    imagePlaceholder.classList.add('hidden');
}

/**
 * Sets the loading state of the UI.
 * @param isLoading True to show loader, false to hide.
 */
function setLoading(isLoading: boolean) {
    loader.classList.toggle('hidden', !isLoading);
    if(isLoading) {
        generatedImage.classList.remove('visible');
        imagePlaceholder.classList.remove('hidden');
        imagePlaceholder.textContent = 'Generating your masterpiece...';
    }
}

/**
 * Displays an error message in the UI.
 * @param message The error message to display.
 */
function handleError(message: string) {
    errorContainer.textContent = message;
    imagePlaceholder.textContent = 'Your generated image will appear here';
}

/**
 * Clears any existing error messages.
 */
function clearError() {
    errorContainer.textContent = '';
}

// --- Initialize App ---
init();