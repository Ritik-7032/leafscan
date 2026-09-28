import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import CameraModal from './components/CameraModal';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import HomeScreen from './screens/HomeScreen';
import ResultScreen from './screens/ResultScreen';
import HistoryScreen from './screens/HistoryScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ProfileScreen from './screens/ProfileScreen';
import AboutScreen from './screens/AboutScreen';
import { classifyLeafImage, initModel } from './services/classifier';

export default function App() {
  const [currentScreen, setScreen] = useState('home');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzingImage, setAnalyzingImage] = useState(null);
  const [currentResult, setCurrentResult] = useState(null);
  const [activeImageSrc, setActiveImageSrc] = useState(null);

  useEffect(() => {
    // Preload model & labels in the background
    initModel();
  }, []);

  const handleImageSelected = async (imageSrc) => {
    setActiveImageSrc(imageSrc);
    setAnalyzingImage(imageSrc);
    setIsAnalyzing(true);

    try {
      // Small visual delay so the user sees the scan line
      await new Promise(r => setTimeout(r, 600));
      const result = await classifyLeafImage(imageSrc);
      setCurrentResult(result);
      setScreen('result');
    } catch (err) {
      console.error('Classification error:', err);
      alert('Could not analyze the image. Please try again with a clearer photo.');
    } finally {
      setIsAnalyzing(false);
      setAnalyzingImage(null);
    }
  };

  const handleLiveCameraCapture = (dataUrl) => {
    setIsCameraOpen(false);
    handleImageSelected(dataUrl);
  };

  const handleSelectHistoricalScan = (scan) => {
    // Reconstruct result object from history
    setCurrentResult({
      vegetable: scan.vegetable,
      disease: scan.disease,
      confidence: scan.confidence,
      isHealthy: scan.isHealthy,
      isUncertain: scan.confidence < 60,
      thumbnail: scan.thumbnail,
      tips: {
        cause: scan.isHealthy ? 'Optimal plant health and vigor.' : 'Crop disease pathogen detected.',
        treatment: scan.isHealthy ? 'Keep monitoring and water properly at the base.' : 'Prune affected foliage and apply targeted bio-fungicide.',
        prevention: 'Maintain proper crop rotation and avoid wetting upper foliage.'
      }
    });
    setActiveImageSrc(scan.thumbnail);
    setScreen('result');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col mesh-gradient transition-colors duration-300">
      <Navbar currentScreen={currentScreen} setScreen={setScreen} />
      <PWAInstallPrompt />

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-5">
        {currentScreen === 'home' && (
          <HomeScreen
            onImageSelected={handleImageSelected}
            isAnalyzing={isAnalyzing}
            analyzingImage={analyzingImage}
            onOpenLiveCamera={() => setIsCameraOpen(true)}
          />
        )}

        {currentScreen === 'result' && (
          <ResultScreen
            result={currentResult}
            imageSrc={activeImageSrc}
            onScanAgain={() => setScreen('home')}
            onNavigateToLogin={() => setScreen('login')}
          />
        )}

        {currentScreen === 'history' && (
          <HistoryScreen
            onScanNew={() => setScreen('home')}
            onSelectHistoricalScan={handleSelectHistoricalScan}
          />
        )}

        {currentScreen === 'login' && <LoginScreen setScreen={setScreen} />}
        {currentScreen === 'register' && <RegisterScreen setScreen={setScreen} />}
        {currentScreen === 'profile' && <ProfileScreen setScreen={setScreen} />}
        {currentScreen === 'about' && <AboutScreen />}
      </main>

      {/* Floating Bottom Navigation for Mobile */}
      <BottomNav
        currentScreen={currentScreen}
        setScreen={setScreen}
        onOpenScanMenu={() => setIsCameraOpen(true)}
      />

      {/* Live Stream Camera Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleLiveCameraCapture}
      />
    </div>
  );
}
