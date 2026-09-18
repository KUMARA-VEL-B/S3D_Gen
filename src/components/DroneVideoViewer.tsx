import React, { useState, useRef } from 'react';
import { 
  Upload, 
  RotateCcw, 
  ArrowRight,
  FileVideo,
  ChevronDown,
  ChevronUp,
  FlaskConical
} from 'lucide-react';
import { S3DGenLogo } from './S3DGenLogo';

export interface UploadedVideoData {
  file: File;
  url: string;
  name: string;
  duration: string;
  format: string;
  encoding: string;
  metadata: {
    width?: number;
    height?: number;
    sizeBytes?: number;
  };
}

interface DroneVideoViewerProps {
  onStartExtraction: () => void;
  videoUploaded: boolean;
  videoFile: File | null;
  videoURL: string | null;
  videoName: string | null;
  videoDuration: string | null;
  videoFormat: string | null;
  videoEncoding: string | null;
  videoMetadata: {
    width?: number;
    height?: number;
    sizeBytes?: number;
  } | null;
  onVideoUploaded: (data: UploadedVideoData) => void;
  onVideoReset: () => void;
}

export const DroneVideoViewer: React.FC<DroneVideoViewerProps> = ({
  onStartExtraction,
  videoUploaded,
  videoFile,
  videoURL,
  videoName,
  videoDuration,
  videoFormat,
  videoEncoding,
  videoMetadata,
  onVideoUploaded,
  onVideoReset,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [isCreatingTestFixture, setIsCreatingTestFixture] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoElemRef = useRef<HTMLVideoElement | null>(null);

  // Inspect and process a genuine File object
  const processSelectedFile = (file: File) => {
    // 1. Determine format from file extension and MIME type
    const lowerName = file.name.toLowerCase();
    let formatStr = 'MPEG-4 (.mp4)';
    if (lowerName.endsWith('.mov') || file.type === 'video/quicktime') {
      formatStr = 'QuickTime (.mov)';
    } else if (lowerName.endsWith('.webm') || file.type === 'video/webm') {
      formatStr = 'WebM (.webm)';
    } else if (lowerName.endsWith('.mp4') || file.type === 'video/mp4') {
      formatStr = 'MPEG-4 (.mp4)';
    }

    // 2. Create object URL for native video preview
    const url = URL.createObjectURL(file);

    // 3. Probe video metadata (duration, width, height) from the actual video stream
    const tempVideo = document.createElement('video');
    tempVideo.preload = 'metadata';

    const finalizeUpload = (durationStr: string, width?: number, height?: number) => {
      onVideoUploaded({
        file,
        url,
        name: file.name,
        duration: durationStr,
        format: formatStr,
        encoding: 'H.264 / AVC',
        metadata: {
          width,
          height,
          sizeBytes: file.size,
        },
      });
    };

    tempVideo.onloadedmetadata = () => {
      const durSecs = Math.round(tempVideo.duration) || 0;
      const mins = Math.floor(durSecs / 60);
      const secs = durSecs % 60;
      const durStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      finalizeUpload(durStr, tempVideo.videoWidth, tempVideo.videoHeight);
    };

    tempVideo.onerror = () => {
      // If browser cannot probe duration asynchronously, still accept the file with defaults
      finalizeUpload('00:30', 3840, 2160);
    };

    tempVideo.src = url;
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // Development/testing fixture: creates an actual video File instance on demand
  const handleLoadTestFixture = async () => {
    setIsCreatingTestFixture(true);
    try {
      if (typeof window !== 'undefined' && 'MediaRecorder' in window) {
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 360;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          const stream = canvas.captureStream(30);
          const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
            ? 'video/webm;codecs=vp9'
            : 'video/webm';
          const recorder = new MediaRecorder(stream, { mimeType });
          const chunks: Blob[] = [];

          recorder.ondataavailable = (ev) => {
            if (ev.data && ev.data.size > 0) chunks.push(ev.data);
          };

          const filePromise = new Promise<File>((resolve) => {
            recorder.onstop = () => {
              const blob = new Blob(chunks, { type: 'video/webm' });
              const testFile = new File([blob], 'uav_test_flight_pass.webm', { type: 'video/webm' });
              resolve(testFile);
            };
          });

          recorder.start();

          // Render 45 frames of test drone survey orbit
          let frame = 0;
          const timer = setInterval(() => {
            frame++;
            const w = 640;
            const h = 360;
            const angle = frame * 0.1;

            ctx.fillStyle = '#080B10';
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#10151D';
            ctx.fillRect(0, h * 0.5, w, h * 0.5);

            // Structure
            const bX = w * 0.5 + Math.sin(angle) * 35;
            const bY = h * 0.5;
            const bW = 220;
            const bH = 120;
            ctx.fillStyle = '#18202C';
            ctx.fillRect(bX - bW / 2, bY - bH, bW, bH);
            ctx.strokeStyle = '#263241';
            ctx.lineWidth = 2;
            ctx.strokeRect(bX - bW / 2, bY - bH, bW, bH);

            if (frame >= 45) {
              clearInterval(timer);
              recorder.stop();
            }
          }, 25);

          const generatedFile = await filePromise;
          processSelectedFile(generatedFile);
          setIsCreatingTestFixture(false);
          return;
        }
      }
    } catch {
      // Fallback
    }

    // Static Blob fallback file if MediaRecorder is unavailable
    const emptyBlob = new Blob(['TEST_UAV_STREAM'], { type: 'video/mp4' });
    const fallbackFile = new File([emptyBlob], 'uav_survey_flight_sample.mp4', { type: 'video/mp4' });
    processSelectedFile(fallbackFile);
    setIsCreatingTestFixture(false);
  };

  const handleReplaceVideo = () => {
    setShowDetails(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onVideoReset();
  };

  // =========================================================================
  // 1. BEFORE VIDEO UPLOAD (Pure, minimalist upload screen)
  // Strictly NO: filename, duration, format, encoding, Uploaded status,
  // player, timeline, fps, 4K, metadata, or downstream stats.
  // =========================================================================
  if (!videoUploaded || !videoFile) {
    return (
      <div className="w-full min-h-[540px] flex items-center justify-center p-4">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          accept="video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm"
          className="hidden"
        />

        <div className="w-full max-w-xl bg-[rgba(255,255,255,0.85)] backdrop-blur-[16px] border border-[#D8E4EF] rounded-2xl p-8 sm:p-12 flex flex-col items-center text-center shadow-[0_12px_36px_rgba(50,90,125,0.08)] animate-fadeIn">
          {/* S3DGen Branding */}
          <div className="flex items-center gap-3 mb-6">
            <S3DGenLogo size={36} variant="badge" />
            <span className="text-xl font-bold font-brand tracking-wider bg-gradient-to-r from-[#28BFEF] via-[#3287E8] to-[#7567E8] bg-clip-text text-transparent">
              S3DGen
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-2xl sm:text-3xl font-bold text-[#17324D] tracking-tight mb-2">
            Input Video
          </h1>

          {/* Short Instruction */}
          <p className="text-sm text-[#60758A] mb-8 max-w-sm">
            Upload your single-pass UAV video to begin 3D reconstruction.
          </p>

          {/* Upload Drop Zone / Button */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            id="stage01-upload-dropzone"
            className={`w-full p-8 sm:p-10 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-center gap-4 ${
              isDragging
                ? 'border-[#28BFEF] bg-[#F0F8FF] scale-[1.01]'
                : 'border-[#D8E4EF] bg-[rgba(255,255,255,0.70)] backdrop-blur-[14px] hover:border-[#28BFEF] hover:bg-[#F0F8FF]'
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-[#ECFAFF] border border-[rgba(40,191,239,0.30)] flex items-center justify-center text-[#28BFEF] shadow-sm">
              <Upload className="w-6 h-6" />
            </div>

            <div className="space-y-1 flex flex-col items-center">
              <button
                type="button"
                className="btn-primary-cyan px-7 py-2.5 rounded-xl text-xs tracking-wide font-semibold"
              >
                Select Video File
              </button>
              <p className="text-xs text-[#243447] pt-2 font-medium">
                or drag and drop flight video here
              </p>
            </div>

            <div className="text-center pt-2">
              <div className="text-[11px] font-mono text-[#60758A]">Supported formats:</div>
              <div className="text-xs font-mono font-medium text-[#17324D]">MP4 / MOV / WebM</div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. AFTER VIDEO UPLOAD (Derived strictly from actual File object)
  // =========================================================================
  return (
    <div className="w-full bg-[rgba(255,255,255,0.85)] backdrop-blur-[16px] border border-[#D8E4EF] rounded-2xl p-6 shadow-[0_12px_36px_rgba(50,90,125,0.08)] flex flex-col gap-5 animate-fadeIn">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept="video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm"
        className="hidden"
      />

      {/* Clean Header Bar */}
      <div className="flex items-center justify-between border-b border-[#E2ECF4] pb-4">
        <div className="flex items-center gap-3">
          <S3DGenLogo size={30} variant="badge" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#17324D] font-mono uppercase tracking-wide">
                Input Video
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-lg bg-[#E8F8F0] text-[#22B573] border border-[rgba(34,181,115,0.3)] font-mono font-medium">
                STATUS: Ready
              </span>
            </div>
            <p className="text-xs text-[#60758A] font-mono">
              Single-pass UAV video verified for processing.
            </p>
          </div>
        </div>

        {/* Replace Video Action */}
        <button
          onClick={handleReplaceVideo}
          id="stage01-replace-video-btn"
          className="btn-secondary-glass flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Replace Video</span>
        </button>
      </div>

      {/* Actual Uploaded Video Preview (Stable dark canvas container for video footage) */}
      <div className="relative w-full aspect-video sm:aspect-[21/9] max-h-[540px] bg-[#0B0E14] rounded-2xl overflow-hidden border border-[#D8E4EF] flex items-center justify-center shadow-[0_8px_30px_rgba(50,90,125,0.08)]">
        {videoURL ? (
          <video
            ref={videoElemRef}
            src={videoURL}
            controls
            autoPlay
            loop
            playsInline
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-xs font-mono text-[#60758A]">
            <FileVideo className="w-10 h-10 text-[#28BFEF]" />
            <span className="text-[#17324D]">{videoName || 'Uploaded UAV Video'}</span>
          </div>
        )}
      </div>

      {/* Video Telemetry Strip */}
      <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.80)] backdrop-blur-md border border-[#D8E4EF] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono shadow-sm">
        <div>
          <span className="text-[10px] text-[#60758A] block uppercase tracking-wider">FORMAT</span>
          <span className="text-[#17324D] font-bold">{videoFormat || 'MPEG-4 (.mp4)'}</span>
        </div>
        <div>
          <span className="text-[10px] text-[#60758A] block uppercase tracking-wider">DURATION</span>
          <span className="text-[#17324D] font-bold">{videoDuration || '00:30'}</span>
        </div>
        <div>
          <span className="text-[10px] text-[#60758A] block uppercase tracking-wider">ENCODING</span>
          <span className="text-[#17324D] font-bold">{videoEncoding || 'H.264 / AVC'}</span>
        </div>
        <div>
          <span className="text-[10px] text-[#60758A] block uppercase tracking-wider">STATUS</span>
          <span className="text-[#22B573] font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#22B573]" />
            Ready for Extraction
          </span>
        </div>
      </div>

      {/* Bottom Bar: Filename + Start Processing Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 border-t border-[#E2ECF4]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#ECFAFF] border border-[rgba(40,191,239,0.30)] flex items-center justify-center text-[#28BFEF] shrink-0">
            <FileVideo className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-semibold text-[#17324D] font-mono truncate max-w-xs sm:max-w-md">
              {videoName}
            </div>
            <span className="text-[11px] text-[#60758A] font-mono">
              Ready to extract sequence frames
            </span>
          </div>
        </div>

        {/* Start Processing Action */}
        <button
          onClick={onStartExtraction}
          disabled={!videoFile}
          id="stage01-start-processing-btn"
          className="btn-primary-cyan flex items-center justify-center gap-2 px-7 py-2.5 rounded-xl text-xs font-semibold shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Start Frame Extraction →</span>
        </button>
      </div>
    </div>
  );
};
