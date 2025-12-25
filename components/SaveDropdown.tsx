
import React, { useState, useEffect } from 'react';
import { backend } from '../services/mockBackend';
import { Board } from '../types';

interface SaveDropdownProps {
  imageId: string;
  onClose: () => void;
}

const SaveDropdown: React.FC<SaveDropdownProps> = ({ imageId, onClose }) => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [newBoardName, setNewBoardName] = useState('');

  useEffect(() => {
    setBoards(backend.getBoards());
  }, []);

  const handleSave = (boardId: string) => {
    backend.saveToBoard(boardId, imageId);
    onClose();
  };

  const handleCreateAndSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardName.trim()) return;
    const board = backend.createBoard(newBoardName.trim());
    backend.saveToBoard(board.board_id, imageId);
    onClose();
  };

  return (
    <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 p-2 animate-in slide-in-from-top-2 duration-200">
      <div className="p-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Save to Board</div>
      
      <div className="max-h-48 overflow-y-auto custom-scrollbar">
        {boards.length === 0 ? (
          <p className="p-3 text-sm text-gray-500 italic">No boards yet</p>
        ) : (
          boards.map(board => (
            <button
              key={board.board_id}
              onClick={() => handleSave(board.board_id)}
              className="w-full text-left p-3 hover:bg-gray-50 rounded-xl text-sm font-semibold text-gray-700 transition-colors flex items-center justify-between group"
            >
              {board.name}
              <span className="opacity-0 group-hover:opacity-100 text-red-600">Save</span>
            </button>
          ))
        )}
      </div>

      <div className="border-t border-gray-100 mt-2 pt-2">
        <form onSubmit={handleCreateAndSave} className="p-2 flex gap-2">
          <input
            type="text"
            placeholder="New board..."
            className="flex-1 bg-gray-50 text-xs p-2 rounded-lg border-none focus:ring-1 focus:ring-red-500"
            value={newBoardName}
            onChange={(e) => setNewBoardName(e.target.value)}
          />
          <button type="submit" className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default SaveDropdown;
