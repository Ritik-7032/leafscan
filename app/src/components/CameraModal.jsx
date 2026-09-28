import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, AlertCircle } from 'lucide-react';

export default function CameraModal({ isOpen, onClose, onCapture }) {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');
  const [cameraError, setCameraError] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    startCamera();
    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    stopCamera();
    setCameraError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.warn('Camera access failed:', err);
      setCameraError('Unable to open live camera preview. Please allow camera permissions or use direct camera capture.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const handleCapture = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    stopCamera();
    onCapture(dataUrl);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 rounded-3xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 flex items-center justify-between text-white border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-leaf-400" />
            <h3 className="font-semibold text-sm">Align Leaf in Center</h3>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Area */}
        <div className="relative aspect-[3/4] bg-black overflow-hidden flex items-center justify-center">
          {cameraError ? (
            <div className="p-6 text-center text-slate-300 flex flex-col items-center">
              <AlertCircle className="w-10 h-10 text-amber-400 mb-2" />
              <p className="text-sm">{cameraError}</p>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {/* Target leaf reticle overlay */}
              <div className="absolute inset-8 border-2 border-dashed border-leaf-400/80 rounded-3xl pointer-events-none flex items-center justify-center">
                <div className="w-12 h-12 border border-leaf-300/40 rounded-full animate-ping opacity-75" />
              </div>
            </>
          )}
        </div>

        {/* Footer controls */}
        <div className="p-5 flex items-center justify-around bg-slate-950/90 border-t border-slate-800">
          <button
            onClick={toggleCamera}
            className="p-3 rounded-full bg-slate-800 text-slate-200 hover:bg-slate-700 transition"
            title="Switch Front/Back Camera"
          >
            <RefreshCw className="w-5 h-5" />
          </button>

          <button
            onClick={handleCapture}
            disabled={!!cameraError}
            className="w-16 h-16 rounded-full bg-gradient-to-tr from-leaf-600 to-emerald-400 p-1 shadow-lg shadow-leaf-500/50 hover:scale-105 active:scale-95 disabled:opacity-50 transition"
          >
            <div className="w-full h-full rounded-full border-2 border-white flex items-center justify-center bg-white/20">
              <div className="w-10 h-10 rounded-full bg-white" />
            </div>
          </button>

          <div className="w-11" /> {/* Spacer for balance */}
        </div>
      </div>
    </div>
  );
}
