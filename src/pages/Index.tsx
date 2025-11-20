import HeadPoseDetector from '@/components/HeadPoseDetector';
import { HeaderControls } from '@/components/HeaderControls';

const Index = () => {
  return (
    <div className="relative min-h-screen">
      <div className="fixed top-4 right-4 z-50">
        <HeaderControls />
      </div>
      <HeadPoseDetector />
    </div>
  );
};

export default Index;
