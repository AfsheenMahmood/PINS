
import React, { useState, useEffect, useCallback } from 'react';
import { ImageMetadata, User, Board } from './types';
import { backend } from './services/mockBackend';
import Layout from './components/Layout';
import ImageCard from './components/ImageCard';
import UploadModal from './components/UploadModal';
import ImageDetailModal from './components/ImageDetailModal';
import LoginModal from './components/LoginModal';
import CollageView from './components/CollageView';
import { Icons } from './constants';

type ViewMode = 'FEED' | 'MOODBOARDS' | 'BOARD_DETAIL';

const App: React.FC = () => {
  const [images, setImages] = useState<ImageMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(backend.getCurrentUser());
  
  // Navigation State
  const [viewMode, setViewMode] = useState<ViewMode>('FEED');
  const [activeBoard, setActiveBoard] = useState<Board | null>(null);
  const [isCollageActive, setIsCollageActive] = useState(false);

  // Modal states
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageMetadata | null>(null);

  const fetchContent = useCallback(async () => {
    setLoading(true);
    try {
      if (viewMode === 'FEED') {
        if (searchQuery) {
          const results = await backend.search(searchQuery);
          setImages(results);
        } else {
          const feed = await backend.getFeed();
          setImages(feed);
        }
      } else if (viewMode === 'BOARD_DETAIL' && activeBoard) {
        const boardImages = activeBoard.image_ids
          .map(id => backend.getImage(id))
          .filter((img): img is ImageMetadata => !!img);
        setImages(boardImages);
      }
    } catch (error) {
      console.error("Failed to fetch content", error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, viewMode, activeBoard]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const handleUpload = async (data: any) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    await backend.uploadImage(data);
    setIsUploadOpen(false);
    fetchContent();
  };

  const handleLogout = () => {
    backend.logout();
    setCurrentUser(null);
    setViewMode('FEED');
    fetchContent();
  };

  const handleAuthSuccess = () => {
    setCurrentUser(backend.getCurrentUser());
    setIsAuthOpen(false);
    fetchContent();
  };

  const handleProtectedAction = (action: () => void) => {
    if (!currentUser) {
      setIsAuthOpen(true);
    } else {
      action();
    }
  };

  const openBoard = (board: Board) => {
    setActiveBoard(board);
    setViewMode('BOARD_DETAIL');
    setIsCollageActive(false);
  };

  return (
    <Layout 
      user={currentUser}
      onSearch={(q) => { setSearchQuery(q); setViewMode('FEED'); }} 
      onUploadClick={() => handleProtectedAction(() => setIsUploadOpen(true))}
      onLogoClick={() => { setSearchQuery(''); setViewMode('FEED'); }}
      onAuthClick={() => setIsAuthOpen(true)}
      onLogout={handleLogout}
      onMoodboardsClick={() => handleProtectedAction(() => setViewMode('MOODBOARDS'))}
    >
      {/* Header Info based on View Mode */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {viewMode === 'FEED' ? (searchQuery ? `Semantic results for "${searchQuery}"` : 'Discovery Feed') :
             viewMode === 'MOODBOARDS' ? 'My Moodboards' : 
             activeBoard?.name}
          </h1>
          <p className="text-gray-500 mt-1">
            {viewMode === 'FEED' ? (searchQuery ? 'Ranked by metadata relevance' : 'Personalized metadata synthesis') : 
             viewMode === 'MOODBOARDS' ? 'Your personal collections' : 
             `${images.length} images synthesized`}
          </p>
        </div>

        {viewMode === 'BOARD_DETAIL' && (
          <div className="flex bg-gray-100 p-1 rounded-2xl self-start">
            <button 
              onClick={() => setIsCollageActive(false)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${!isCollageActive ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
            >
              Grid
            </button>
            <button 
              onClick={() => setIsCollageActive(true)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${isCollageActive ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
            >
              Collage Mode
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 font-medium">Analyzing metadata patterns...</p>
        </div>
      ) : (
        <>
          {viewMode === 'MOODBOARDS' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {backend.getBoards().length === 0 ? (
                <div className="col-span-full py-20 text-center bg-gray-50 rounded-[2.5rem] border-2 border-dashed">
                  <p className="text-gray-500">You haven't created any boards yet.</p>
                  <button 
                    onClick={() => {
                      const name = prompt('Enter moodboard name:');
                      if (name) { backend.createBoard(name); fetchContent(); }
                    }}
                    className="mt-4 text-red-600 font-bold"
                  >
                    + Create your first board
                  </button>
                </div>
              ) : (
                backend.getBoards().map(board => (
                  <div 
                    key={board.board_id} 
                    onClick={() => openBoard(board)}
                    className="aspect-square bg-gray-100 rounded-[2rem] p-6 flex flex-col justify-between cursor-pointer hover:bg-gray-200 transition-colors group"
                  >
                    <div className="flex -space-x-4">
                      {board.image_ids.slice(0, 3).map((id, i) => (
                        <div key={id} className="w-16 h-16 rounded-full border-4 border-white overflow-hidden shadow-lg transform rotate-6" style={{zIndex: 3-i}}>
                           <img src={backend.getImage(id)?.image_url} className="w-full h-full object-cover" />
                        </div>
                      ))}
                      {board.image_ids.length === 0 && <div className="w-16 h-16 rounded-full bg-gray-200 border-4 border-white" />}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{board.name}</h3>
                      <p className="text-sm text-gray-500">{board.image_ids.length} images</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : viewMode === 'BOARD_DETAIL' && isCollageActive ? (
            <CollageView images={images} onImageClick={setSelectedImage} />
          ) : images.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">No objects found</h2>
              <p className="text-gray-500 mt-2">The semantic engine couldn't match your query to any metadata.</p>
              <button 
                onClick={() => setSearchQuery('')}
                className="mt-4 text-red-600 font-bold hover:underline"
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className="masonry-grid">
              {images.map((image) => (
                <ImageCard 
                  key={image.image_id} 
                  image={image} 
                  onClick={() => setSelectedImage(image)}
                  onProtectedAction={handleProtectedAction}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {isUploadOpen && (
        <UploadModal 
          onClose={() => setIsUploadOpen(false)} 
          onUpload={handleUpload}
        />
      )}

      {isAuthOpen && (
        <LoginModal 
          onClose={() => setIsAuthOpen(false)} 
          onSuccess={handleAuthSuccess}
        />
      )}

      {selectedImage && (
        <ImageDetailModal 
          image={selectedImage} 
          onClose={() => setSelectedImage(null)}
          onImageClick={(img) => setSelectedImage(img)}
          onProtectedAction={handleProtectedAction}
        />
      )}

      <div className="fixed bottom-4 left-4 z-30 pointer-events-none">
        <div className="bg-black/80 backdrop-blur-md text-white px-4 py-2 rounded-xl text-[10px] md:text-xs font-mono shadow-2xl opacity-70">
          <p className="font-bold mb-1">SEMANTIC ENGINE ACTIVE</p>
          <p>Scoring: Meta-Weighted Heuristic</p>
          <p>Index: {images.length} Objects Analyzed</p>
        </div>
      </div>
    </Layout>
  );
};

export default App;
