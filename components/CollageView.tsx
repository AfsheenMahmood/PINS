
import React from 'react';
import { ImageMetadata } from '../types';

interface CollageViewProps {
  images: ImageMetadata[];
  onImageClick: (img: ImageMetadata) => void;
}

const CollageView: React.FC<CollageViewProps> = ({ images, onImageClick }) => {
  if (images.length === 0) return null;

  return (
    <div className="relative w-full min-h-[600px] p-8 overflow-hidden bg-gray-50 rounded-[3rem]">
      {images.map((img, idx) => {
        // Pseudo-random placement logic for collage feel
        const rotation = (idx % 4 === 0 ? -3 : idx % 4 === 1 ? 4 : idx % 4 === 2 ? -2 : 3) * (idx / 2 + 1);
        const zIndex = idx;
        const scale = 0.8 + (idx % 3) * 0.1;
        
        return (
          <div
            key={img.image_id}
            onClick={() => onImageClick(img)}
            className="absolute cursor-pointer transition-transform hover:scale-105 hover:z-50 duration-500 shadow-2xl rounded-xl overflow-hidden group"
            style={{
              top: `${10 + (idx % 5) * 15}%`,
              left: `${5 + (idx % 4) * 20}%`,
              width: `${250 + (idx % 2) * 100}px`,
              transform: `rotate(${rotation}deg) scale(${scale})`,
              zIndex: zIndex,
            }}
          >
            <img 
              src={img.image_url} 
              alt="" 
              className="w-full h-auto object-cover group-hover:brightness-110" 
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold">
              {img.category}
            </div>
          </div>
        );
      })}
      
      {/* Visual background accents */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15vw] font-black text-gray-200/50 pointer-events-none select-none -rotate-12">
        MOOD
      </div>
    </div>
  );
};

export default CollageView;
