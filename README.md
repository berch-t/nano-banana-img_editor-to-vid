# Nano Banana - AI Image Editor & Video Generator

A powerful web application built with Next.js that allows users to edit images and generate videos using Google's Nano Banana AI and Kling 2.1 Pro via fal.ai. Complete **Upload → Edit → Animate** workflow in one app.

## 🌟 Features

### 🎨 **Image Editing**
- **AI-Powered Image Editing**: Transform images with natural language prompts using Google's Nano Banana
- **Multi-Image Merging**: Combine multiple images seamlessly into one cohesive result
- **Smart Processing**: Handles complex edits with up to 5-minute processing times

### 🎬 **Video Generation**
- **Image-to-Video**: Bring your edited images to life with Kling 2.1 Pro
- **Cinematic Quality**: Professional-grade videos with enhanced visual fidelity
- **Customizable Controls**: Adjust duration (5s/10s), guidance scale, and prompts
- **Dynamic Motion**: Precise camera movements and motion control

### 💪 **Enhanced Reliability**
- **Automatic Retry Logic**: Network issues are handled with smart exponential backoff
- **Health Check Diagnostics**: Built-in connectivity and API status monitoring
- **Robust Error Handling**: Clear, actionable error messages with troubleshooting guides
- **Extended Timeouts**: Generous processing times for complex operations

### 🎨 **User Experience**
- **Dark Theme**: Modern dark interface optimized for extended use
- **Responsive Design**: Works seamlessly across desktop and mobile devices
- **Drag & Drop Upload**: Easy image uploading with visual feedback
- **Real-time Progress**: Clear processing indicators with time expectations
- **Download Results**: Save images and videos directly to your device

## 🚀 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with custom dark theme
- **AI Integration**: fal.ai client for Google's Nano Banana & Kling 2.1 Pro APIs
- **File Upload**: react-dropzone for enhanced UX
- **TypeScript**: Full type safety throughout the application
- **Error Handling**: Custom retry utilities with exponential backoff
- **Deployment**: Optimized for Vercel with extended function timeouts

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- A fal.ai API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/berch-t/nano-banana-img-to-vid.git
cd nano-banana-img-to-vid
```

2. Install dependencies:
```bash
npm install
```

3. **Get your fal.ai API key:**
   - Visit [fal.ai](https://fal.ai) and create a free account
   - Go to your dashboard and copy your API key
   - You'll need this for the next step

4. Set up environment variables:
```bash
cp .env.example .env.local
```

5. Add your fal.ai API key to `.env.local`:
```env
FAL_KEY=fal_your_actual_api_key_here
```
⚠️ **Important**: Replace `your_fal_api_key_here` with your actual API key from fal.ai

6. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### 🔧 Troubleshooting

**Getting connection timeout errors?**
- Visit `/api/health` for detailed diagnostics
- Check your internet connection and firewall settings
- The app automatically retries failed requests

**Getting "FAL API key not configured" error?**
1. Make sure you've signed up at [fal.ai](https://fal.ai)
2. Copy your API key from the fal.ai dashboard
3. Add it to `.env.local` (replace the placeholder text)
4. Restart your development server (`Ctrl+C`, then `npm run dev`)

**Still having issues?**
- Check that `.env.local` exists in your project root
- Make sure there are no extra spaces around your API key
- Verify your API key is valid by testing it on the fal.ai platform
- Check the health endpoint: `http://localhost:3000/api/health`

## 📖 Usage Guide

### 🖼️ Single Image Editing

1. **Upload an Image**: Drag and drop or click to upload in the left panel
2. **Enter a Prompt**: Describe your desired edits (e.g., "make it more vibrant")
3. **Process**: Click "Edit Image" and wait 1-5 minutes for AI processing
4. **Download**: Save the result using the download button

### 🔄 Multi-Image Merging

1. **Switch Mode**: Select "Multi-Image" mode
2. **Upload Images**: Add main/background image and product/object image
3. **Describe Merge**: Enter how you want to combine them
4. **Process**: Wait for the AI to seamlessly merge your images

### 🎬 Video Generation

1. **Create Source**: First edit an image in Single or Multi-Image mode
2. **Switch to Video**: Select "Video Generation" mode
3. **Configure Video**: Set duration, guidance scale, and motion prompt
4. **Generate**: Wait 3-5 minutes for high-quality video creation
5. **Download**: Save your animated video

## 💡 Example Prompts

### Image Editing
- "make the photo more vibrant and colorful"
- "turn this into a vintage film photo"  
- "add a beautiful sunset in the background"
- "convert to black and white with high contrast"
- "add magical sparkles and glowing effects"

### Image Merging
- "add the product from the second image to the first image"
- "place the object on the background seamlessly"
- "combine both images into a realistic scene"
- "merge these images naturally together"

### Video Generation
- "gentle camera movement revealing the scene"
- "slow zoom in with natural lighting changes"
- "cinematic reveal with atmospheric effects"
- "dynamic lighting changes throughout the scene"

## 🔧 API Integration

### Image Editing
- **Endpoint**: `fal-ai/nano-banana/edit`
- **Timeout**: 5 minutes with automatic retries
- **Input**: Image URL(s) and text prompt
- **Output**: Edited image URL and description

### Video Generation
- **Endpoint**: `fal-ai/kling-video/v2.1/pro/image-to-video`
- **Timeout**: 7 minutes with smart retry logic
- **Input**: Image URL, prompt, duration, guidance scale
- **Output**: High-quality MP4 video URL

### Health Check
- **Endpoint**: `/api/health`
- **Purpose**: API connectivity and configuration diagnostics
- **Response**: System status, network tests, and recommendations

## 🚀 Deployment

### Deploy to Vercel

1. Connect your repository to Vercel
2. Add your `FAL_KEY` environment variable in Vercel dashboard
3. Deploy with zero configuration needed

**Important for Production:**
- Vercel Pro plan required for 10+ minute function timeouts
- Health check available at `your-domain.com/api/health`
- Automatic retry handling for network issues

The app is optimized for Vercel with proper function timeouts and environment configuration.

## 📁 Project Structure

```
├── app/
│   ├── api/
│   │   ├── edit-image/         # Image processing API
│   │   ├── generate-video/     # Video generation API  
│   │   └── health/            # Health check diagnostics
│   ├── globals.css            # Global styles with dark theme
│   ├── layout.tsx            # Root layout
│   └── page.tsx             # Main application with 3 modes
├── components/
│   ├── ImageUploader.tsx      # Single image upload
│   ├── MultiImageUploader.tsx # Multi-image upload
│   ├── ImageDisplay.tsx       # Image result display
│   ├── VideoGenerator.tsx     # Video controls and generation
│   ├── VideoDisplay.tsx       # Video player and download
│   ├── PromptInput.tsx       # Prompt input with examples
│   └── ModeSelector.tsx      # Mode switching component
├── utils/
│   └── retryUtils.ts         # Retry logic with exponential backoff
├── docs/
│   ├── nano_banana.md        # Nano Banana API docs
│   └── kling21.md           # Kling 2.1 API docs
└── public/                   # Static assets
```

## ⚡ Performance & Reliability

- **Smart Timeouts**: 5 minutes for images, 7 minutes for videos
- **Automatic Retries**: Network failures are handled transparently
- **Health Monitoring**: Built-in diagnostics for troubleshooting
- **Error Recovery**: Clear user guidance for different error types
- **Progress Indicators**: Realistic time expectations for all operations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details.

## 🔗 Links

- **Live Demo**: [Deploy to see it in action]
- **API Documentation**: [fal.ai](https://fal.ai)
- **Repository**: [GitHub](https://github.com/berch-t/nano-banana-img-to-vid)

---

**Built with ❤️ using Next.js, Tailwind CSS, and the power of AI**