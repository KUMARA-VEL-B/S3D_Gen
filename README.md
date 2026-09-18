# S3DGen

Industrial photogrammetry and autonomous 3D spatial reconstruction dashboard for drone video inspection and structural damage analysis.

S3DGen is a React + TypeScript application for processing UAV inspection video into a structured 3D damage analysis workflow. The app guides users through a staged AI-assisted pipeline: video ingestion, frame extraction, frame selection, camera motion/spatial reference estimation, 3D reconstruction, segmentation, metric validation, and downstream application assessments.

## Features

- Video upload and ingestion for drone/UAV inspection footage
- Frame extraction workflow with staged processing progression
- AI-assisted frame selection and quality review
- 3D reconstruction pipeline with inspection view controls
- Damage scenario exploration and disaster simulation overlays
- Evidence classification and validation metric review
- Presentation-ready reporting and workflow navigation

## Tech Stack

- React 19
- TypeScript
- Vite
- Three.js
- Tailwind CSS
- Lucide React
- Google GenAI SDK

## Project Structure

```text
.
├── src/
│   ├── components/
│   ├── data/
│   ├── utils/
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   ├── types.ts
│   └── vite-env.d.ts
├── .env.example
├── index.html
├── metadata.json
├── package.json
├── tsconfig.json
├── vite.config.ts
├── README.md
└── bun.lock
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install dependencies

```bash
npm install
```

### Environment variables

Create a local environment file based on `.env.example` and add your Gemini API key.

```bash
cp .env.example .env.local
```

Then update the values in `.env.local`:

```dotenv
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
APP_URL="http://localhost:3000"
```

### Run locally

```bash
npm run dev
```

The app will be served on:

```text
http://localhost:3000
```

## Available Scripts

```bash
npm run dev      # start the Vite dev server
npm run build    # production build
npm run preview  # preview production build
npm run lint     # TypeScript type check
npm run clean    # remove build output and server artifacts
```

## Notes

This project is designed for demonstration and workflow-based inspection analysis. It includes simulated 3D damage view states, hazard overlays, and comparative disaster analysis panels intended for visual inspection workflows.

## License

This project is distributed under the project license declared in the repository.
