
import React, { useMemo, useEffect, useState } from 'react';
import { ImageMetadata } from '../types';
import { backend } from '../services/mockBackend';
import { findSimilarImages } from '../utils/analytics';
import ImageCard from './ImageCard';
import { Icons } from '../constants';
import SaveDropdown from './SaveDropdown';

interface ImageDetailModalProps {
  image: ImageMetadata;
  onClose: () => void;
  onImageClick: (img: ImageMetadata) => void;
  onProtectedAction: (action: () => void) => void;
}

const ImageDetailModal: React.FC<ImageDetailModalProps> = ({ image, onClose, onImageClick, onProtectedAction }) => {
  const allImages = backend.getImages();
  const [showSave, setShowSave] = useState(false);
  
  const similarImages = useMemo(() => {
    return findSimilarImages(image, allImages, 10);
  }, [image, allImages]);

  useEffect(() => {
    const modalContent = document.getElementById('modal-scroll-area');
    if (modalContent) modalContent.scrollTo({ top: 0, behavior: 'smooth' });
  }, [image]);

  const handleSaveClick = () => {
    onProtectedAction(() => setShowSave(!showSave));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="absolute top-4 right-4 z-10">
        <button onClick={onClose} className="p-3 bg-white hover:bg-gray-100 text-gray-900 rounded-full transition-transform hover:scale-110 shadow-xl">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>

      <div id="modal-scroll-area" className="w-full h-full md:w-[90vw] md:h-[90vh] bg-white md:rounded-[2.5rem] overflow-y-auto overflow-x-hidden">
        <div className="max-w-7xl mx-auto p-4 md:p-12">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 mb-16">
            <div className="lg:w-1/2">
              <div className="rounded-3xl overflow-hidden shadow-2xl bg-gray-50 relative">
                <img 
                  src={image.image_url} 
                  alt={image.description} 
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>

            <div className="lg:w-1/2 flex flex-col justify-between py-4">
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold">
                      {image.user_id.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-lg text-gray-900">{image.user_id}</p>
                      <p className="text-sm text-gray-500">Curator</p>
                    </div>
                  </div>
                  <div className="relative">
                    <button 
                      onClick={handleSaveClick}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full transition-colors shadow-lg"
                    >
                      Save to Moodboard
                    </button>
                    {showSave && (
                      <SaveDropdown 
                        imageId={image.image_id} 
                        onClose={() => setShowSave(false)} 
                      />
                    )}
                  </div>
                </div>

                <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
                  {image.description || 'Metadata Discovery Shot'}
                </h1>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">Dominant Color Profile</h3>
                    <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                      <div 
                        className="w-10 h-10 rounded-full border border-white shadow-sm"
                        style={{ backgroundColor: image.dominant_color }}
                      />
                      <div>
                        <p className="text-sm font-bold text-gray-800">{image.dominant_color.toUpperCase()}</p>
                        <p className="text-xs text-gray-500">Metadata index value</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">Metadata Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-4 py-2 bg-red-50 text-red-600 font-bold rounded-full text-sm">
                        {image.category}
                      </span>
                      {image.tags.map(tag => (
                        <span key={tag} className="px-4 py-2 bg-gray-100 text-gray-600 font-medium rounded-full text-sm">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-12 flex items-center gap-4">
                <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold py-4 rounded-full transition-all flex items-center justify-center gap-2">
                  <Icons.Share /> Share
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-16 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm">
                <Icons.Trending />
              </span>
              Similarity Analysis
            </h2>
            <p className="text-gray-500 mt-2">Personalized recommendations based on metadata overlap scores.</p>
          </div>

          <div className="masonry-grid pb-20">
            {similarImages.map((img) => (
              <ImageCard 
                key={img.image_id} 
                image={img} 
                onClick={() => onImageClick(img)} 
                onProtectedAction={onProtectedAction}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageDetailModal;
