
import React, { useState } from 'react';
import { ImageMetadata } from '../types';
import { Icons } from '../constants';
import { backend } from '../services/mockBackend';
import SaveDropdown from './SaveDropdown';

interface ImageCardProps {
  image: ImageMetadata;
  onClick: () => void;
  onProtectedAction: (action: () => void) => void;
}

const ImageCard: React.FC<ImageCardProps> = ({ image, onClick, onProtectedAction }) => {
  const [liked, setLiked] = useState(false);
  const [showSave, setShowSave] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    onProtectedAction(() => {
      setLiked(!liked);
      backend.interact(image.image_id, 'like');
    });
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onProtectedAction(() => setShowSave(!showSave));
  };

  return (
    <div 
      className="masonry-item group relative cursor-zoom-in overflow-hidden rounded-2xl transition-transform hover:scale-[1.01]"
      onClick={onClick}
    >
      <img 
        src={image.image_url} 
        alt={image.description} 
        className="w-full h-auto object-cover rounded-2xl brightness-95 group-hover:brightness-100 transition-all"
        loading="lazy"
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-between">
        <div className="flex justify-between items-start relative">
          <button 
            onClick={handleSaveClick}
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-full text-sm shadow-xl transition-all hover:scale-105"
          >
            Save
          </button>
          
          {showSave && (
            <SaveDropdown 
              imageId={image.image_id} 
              onClose={() => setShowSave(false)} 
            />
          )}

          <button 
            onClick={handleLike}
            className={`p-2 rounded-full backdrop-blur-sm transition-colors ${liked ? 'bg-red-500 text-white' : 'bg-white/80 hover:bg-white text-gray-900'}`}
          >
            <Icons.Heart filled={liked} />
          </button>
        </div>
        
        <div className="flex items-center justify-between gap-2">
          <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-gray-800 truncate">
            {image.category}
          </div>
          <button className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white text-gray-800">
            <Icons.Share />
          </button>
        </div>
      </div>

      <div className="mt-2 px-1">
        <h3 className="text-xs font-semibold text-gray-700 truncate">{image.description}</h3>
        <div className="flex gap-1 mt-1">
          {image.tags.slice(0, 2).map(tag => (
            <span key={tag} className="text-[10px] text-gray-400">#{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageCard;
