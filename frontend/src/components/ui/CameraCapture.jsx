import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, X, SwitchCamera, Check } from 'lucide-react';

/**
 * Camera modal that opens a live viewfinder using getUserMedia.
 * Works on both desktop and mobile.
 *
 * Usage:
 *   const [showCamera, setShowCamera] = useState(false);
 *
 *   <CameraCapture
 *       open={showCamera}
 *       onClose={() => setShowCamera(false)}
 *       onCapture={(file) => { setFile(file); setShowCamera(false); }}
 *   />
 */
const CameraCapture = ({ open, onClose, onCapture }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const [facingMode, setFacingMode] = useState('environment');
    const [captured, setCaptured] = useState(null);
    const [error, setError] = useState(null);

    const startCamera = useCallback(async (facing) => {
        // Stop previous stream
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: facing, width: { ideal: 1920 }, height: { ideal: 1080 } },
                audio: false,
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch {
            setError('Unable to access camera. Please check permissions.');
        }
    }, []);

    useEffect(() => {
        if (open) {
            setCaptured(null);
            setError(null);
            startCamera(facingMode);
        }
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(t => t.stop());
                streamRef.current = null;
            }
        };
    }, [open, facingMode, startCamera]);

    const takePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCaptured(dataUrl);
    };

    const confirmPhoto = () => {
        if (!canvasRef.current) return;
        canvasRef.current.toBlob((blob) => {
            const file = new File([blob], `camera_${Date.now()}.jpg`, { type: 'image/jpeg' });
            onCapture(file);
        }, 'image/jpeg', 0.9);
    };

    const retake = () => {
        setCaptured(null);
    };

    const toggleFacing = () => {
        setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
            {/* Close */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
            >
                <X className="w-6 h-6" />
            </button>

            {error ? (
                <div className="text-center p-8">
                    <Camera className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-white text-lg mb-2">Camera Unavailable</p>
                    <p className="text-gray-400 text-sm mb-6">{error}</p>
                    <button onClick={onClose} className="px-6 py-2 bg-white text-gray-900 rounded-lg font-medium">
                        Close
                    </button>
                </div>
            ) : (
                <>
                    {/* Video / Preview */}
                    <div className="w-full h-full flex items-center justify-center">
                        {captured ? (
                            <img src={captured} alt="Captured" className="max-w-full max-h-full object-contain" />
                        ) : (
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="max-w-full max-h-full object-contain"
                            />
                        )}
                    </div>

                    {/* Hidden canvas */}
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Controls */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 flex items-center justify-center gap-6 bg-gradient-to-t from-black/80 to-transparent">
                        {captured ? (
                            <>
                                <button
                                    onClick={retake}
                                    className="px-6 py-2.5 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 transition-colors backdrop-blur-sm"
                                >
                                    Retake
                                </button>
                                <button
                                    onClick={confirmPhoto}
                                    className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                                >
                                    <Check className="w-4 h-4" /> Use Photo
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={toggleFacing}
                                    className="p-3 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors backdrop-blur-sm"
                                    title="Switch camera"
                                >
                                    <SwitchCamera className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={takePhoto}
                                    className="w-16 h-16 bg-white rounded-full border-4 border-white/50 hover:scale-105 transition-transform shadow-lg"
                                    title="Take photo"
                                >
                                    <div className="w-full h-full rounded-full bg-white hover:bg-gray-100 transition-colors" />
                                </button>
                                <div className="w-11" /> {/* Spacer for centering */}
                            </>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default CameraCapture;


