# AI Boiler Room - Deep Techno Experience Generator

An AI-powered web application that generates deep, hypnotic techno mixes based on reference tracks and user preferences.

## Features

- Audio track upload and analysis
- Deep techno mix generation
- Real-time WebGL visualizations
- Waveform display
- Dark, minimal interface

## Setup

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your API keys:
```
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_REPLICATE_API_KEY=your_replicate_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Technology Stack

- Next.js
- React
- Three.js for WebGL visualizations
- WaveSurfer.js for audio waveform display
- Material-UI for components
- OpenAI API for music analysis and generation
- Tailwind CSS for styling

## Usage

1. Upload a reference techno track (MP3/WAV)
2. Wait for the AI to analyze the track's characteristics
3. Customize generation parameters if desired
4. Generate a new 60-minute techno mix
5. Download or stream the generated mix

## License

MIT
