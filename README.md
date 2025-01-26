# AI Boiler Room 🎵

An AI-powered techno music generator that creates custom tracks based on your style preferences and audio input. Features a dark, immersive interface with video background and real-time audio visualization.

## Features

- 🎚️ Style Selection
  - **Mood**: Dark (Industrial Techno), Very Dark (Dark Ambient), or Disturbing (Horror Techno)
  - **Speed**: Vibing (125 BPM), Cool (130 BPM), or Speed (140 BPM)
  - **Experimental Elements**: Glitch, Acid, Drone, Noise, or Abstract

- 🎤 Audio Input & Visualization
  - Record audio samples directly in the browser
  - Real-time audio visualization
  - Beautiful video background for immersive experience

- 🤖 AI Music Generation
  - Powered by Meta's MusicGen model via Replicate API
  - Real-time generation progress tracking
  - Automatic style-based prompt generation
  - Audio continuation from your input samples

## Project Structure

```
src/
├── components/
│   ├── AudioPlayer.tsx     # Custom audio player with visualization
│   ├── AudioRecorder.tsx   # Browser-based audio recording
│   ├── StyleSelector.tsx   # Style options UI
│   ├── VideoBackground.tsx # Ambient background video
│   └── Visualizer.tsx      # Audio visualization
├── pages/
│   ├── api/
│   │   └── generate.ts     # MusicGen API endpoint
│   └── index.tsx           # Main application page
└── utils/
    └── api.ts             # API utilities
```

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ai-boiler-room.git
cd ai-boiler-room
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file with:
```
NEXT_PUBLIC_REPLICATE_API_KEY=your_replicate_api_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to Use

1. Choose your style:
   - Select mood for the overall atmosphere
   - Set speed/tempo for the rhythm
   - Pick experimental elements for unique character

2. Record audio (optional):
   - Click the record button
   - Record up to 30 seconds of audio
   - The recording will be used as inspiration

3. Generate your track:
   - Generation starts automatically after recording
   - Watch the progress indicators (15-30 seconds)
   - Your custom track will play automatically when ready

## Technology Stack

- **Frontend**:
  - Next.js with TypeScript
  - Material-UI for components
  - Web Audio API for recording/playback
  - Canvas for visualizations

- **Backend**:
  - Next.js API routes
  - Meta's MusicGen (via Replicate)

## Development

The project uses:
- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Tailwind CSS for styling

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/YourFeature`
3. Commit your changes: `git commit -m 'Add YourFeature'`
4. Push to the branch: `git push origin feature/YourFeature`
5. Open a pull request

## License

MIT License - feel free to use this project however you'd like!
