
import React, { useState, useRef } from 'react';
import { CATEGORIES, TAGS_POOL } from '../constants';

interface UploadModalProps {
  onClose: () => void;
  onUpload: (data: any) => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ onClose, onUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    category: CATEGORIES[0],
    description: '',
    dominant_color: '#ff0000',
    tags: [] as string[],
    image_url: ''
  });
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image_url: reader.result as string }));
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image_url) {
      alert("Please upload an image or provide a URL");
      return;
    }
    // Basic hex validation check
    if (!/^#[0-9A-F]{6}$/i.test(formData.dominant_color)) {
      alert("Please enter a valid hex color (e.g. #ff0000)");
      return;
    }
    onUpload(formData);
  };

  const toggleTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag) 
        : [...prev.tags, tag]
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]">
        {/* Left Side: Upload Area */}
        <div 
          className="md:w-1/2 bg-gray-50 flex items-center justify-center border-r border-gray-100 p-8 cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={handleFileChange}
          />
          
          {formData.image_url ? (
            <img 
              src={formData.image_url} 
              alt="Preview" 
              className="max-h-full max-w-full rounded-2xl shadow-xl object-contain animate-in zoom-in duration-300"
            />
          ) : (
            <div className="text-center p-12 border-4 border-dashed border-gray-200 rounded-[2rem] w-full h-full flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
              </div>
              <p className="text-gray-900 font-bold text-lg">Choose a file or drag and drop</p>
              <p className="text-sm text-gray-500 mt-2">High quality image (JPG, PNG) recommended</p>
              {isUploading && <p className="mt-4 text-red-600 animate-pulse font-medium">Processing file...</p>}
            </div>
          )}
        </div>

        {/* Right Side: Metadata Form */}
        <div className="md:w-1/2 p-8 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Image Metadata</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Or paste Image URL</label>
              <input
                type="text"
                placeholder="https://example.com/image.jpg"
                className="w-full bg-gray-50 border-gray-200 border rounded-xl p-3 focus:ring-2 focus:ring-red-500 focus:outline-none"
                value={formData.image_url.startsWith('data:') ? '' : formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select 
                  className="w-full bg-gray-50 border-gray-200 border rounded-xl p-3 focus:ring-2 focus:ring-red-500 focus:outline-none"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Dominant Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    className="h-12 w-12 rounded-xl cursor-pointer shadow-sm border border-gray-200"
                    value={formData.dominant_color}
                    onChange={(e) => setFormData({ ...formData, dominant_color: e.target.value })}
                  />
                  <input
                    type="text"
                    className="flex-1 bg-gray-50 border-gray-200 border rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none font-mono"
                    value={formData.dominant_color}
                    placeholder="#ff0000"
                    maxLength={7}
                    onChange={(e) => setFormData({ ...formData, dominant_color: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <textarea
                rows={3}
                placeholder="Add a detailed description for better indexing..."
                className="w-full bg-gray-50 border-gray-200 border rounded-xl p-3 focus:ring-2 focus:ring-red-500 focus:outline-none resize-none"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tags</label>
              <div className="flex flex-wrap gap-2">
                {TAGS_POOL.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      formData.tags.includes(tag) 
                        ? 'bg-red-500 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isUploading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-full transition-all shadow-lg hover:shadow-xl transform active:scale-[0.98]"
            >
              {isUploading ? 'Uploading...' : 'Publish to Feed'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
