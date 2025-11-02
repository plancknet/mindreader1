import { useEffect, useRef, useState } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

type DetectedSide = 'left' | 'right' | 'center' | null;

interface UseHeadPoseDetectionOptions {
  threshold?: number;
  detectionTime?: number;
  onSideDetected?: (side: 'left' | 'right') => void;
}

export const useHeadPoseDetection = ({
  threshold = 0.07,
  detectionTime = 5,
  onSideDetected
}: UseHeadPoseDetectionOptions = {}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [faceLandmarker, setFaceLandmarker] = useState<FaceLandmarker | null>(null);
  const [currentSide, setCurrentSide] = useState<DetectedSide>(null);
  const [timer, setTimer] = useState(0);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  const sideStartTimeRef = useRef<number | null>(null);
  const lastSideRef = useRef<DetectedSide>(null);
  const animationFrameRef = useRef<number | null>(null);
  const hasDetectedRef = useRef(false);

  useEffect(() => {
    const initializeFaceLandmarker = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );
        
        const landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'GPU'
          },
          runningMode: 'VIDEO',
          numFaces: 1
        });
        
        setFaceLandmarker(landmarker);
        setIsModelLoading(false);
      } catch (err) {
        console.error('Error loading face landmarker:', err);
        setError('Erro ao carregar modelo de detecção');
        setIsModelLoading(false);
      }
    };

    initializeFaceLandmarker();
  }, []);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: 1280, height: 720 }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setCameraActive(true);
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        setError('Não foi possível acessar a câmera');
      }
    };

    if (!isModelLoading && faceLandmarker) {
      startCamera();
    }

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isModelLoading, faceLandmarker]);

  useEffect(() => {
    if (!faceLandmarker || !videoRef.current || !cameraActive) return;

    const detectFace = () => {
      if (!videoRef.current || !faceLandmarker) return;

      const video = videoRef.current;
      const startTimeMs = performance.now();
      const results = faceLandmarker.detectForVideo(video, startTimeMs);

      if (results.faceLandmarks && results.faceLandmarks.length > 0) {
        const landmarks = results.faceLandmarks[0];
        
        const noseTip = landmarks[1];
        const leftEyeInner = landmarks[133];
        const rightEyeInner = landmarks[362];

        const faceCenter = {
          x: (leftEyeInner.x + rightEyeInner.x) / 2,
          y: (leftEyeInner.y + rightEyeInner.y) / 2
        };

        const eyeDistance = Math.abs(rightEyeInner.x - leftEyeInner.x);
        const noseOffset = noseTip.x - faceCenter.x;
        const rotationRatio = noseOffset / (eyeDistance * 0.5);
        
        let side: DetectedSide = 'center';
        
        if (rotationRatio < -threshold) {
          side = 'left';
        } else if (rotationRatio > threshold) {
          side = 'right';
        }

        setCurrentSide(side);

        if (side !== 'center') {
          if (lastSideRef.current === side) {
            if (sideStartTimeRef.current === null) {
              sideStartTimeRef.current = Date.now();
            } else {
              const elapsed = (Date.now() - sideStartTimeRef.current) / 1000;
              const clampedElapsed = Math.min(elapsed, detectionTime);
              setTimer(clampedElapsed);

              if (elapsed >= detectionTime && !hasDetectedRef.current) {
                hasDetectedRef.current = true;
                onSideDetected?.(side);
              }
            }
          } else {
            sideStartTimeRef.current = Date.now();
            lastSideRef.current = side;
            setTimer(0);
            hasDetectedRef.current = false;
          }
        } else {
          sideStartTimeRef.current = null;
          lastSideRef.current = null;
          setTimer(0);
          hasDetectedRef.current = false;
        }
      } else {
        setCurrentSide(null);
        sideStartTimeRef.current = null;
        lastSideRef.current = null;
        setTimer(0);
        hasDetectedRef.current = false;
      }

      animationFrameRef.current = requestAnimationFrame(detectFace);
    };

    detectFace();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [faceLandmarker, cameraActive, threshold, detectionTime, onSideDetected]);

  const resetDetection = () => {
    setTimer(0);
    sideStartTimeRef.current = null;
    lastSideRef.current = null;
    hasDetectedRef.current = false;
  };

  return {
    videoRef,
    currentSide,
    timer,
    isModelLoading,
    error,
    cameraActive,
    resetDetection
  };
};
