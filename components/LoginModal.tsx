
import React, { useState } from 'react';
import { backend } from '../services/mockBackend';

interface LoginModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onSuccess }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isSignup) {
      if (!username || !email || !password) {
        setError('All fields are required');
        return;
      }
      backend.signup(username, email, password);
      onSuccess();
    } else {
      const user = backend.login(email, password);
      if (user) {
        onSuccess();
      } else {
        setError('Invalid email or password');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-[2rem] overflow-hidden shadow-2xl p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mb-4">P</div>
          <h2 className="text-3xl font-bold text-gray-900">Welcome to PinMeta</h2>
          <p className="text-gray-500 mt-2">Discover new ideas based on metadata</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <input
              type="text"
              placeholder="Username"
              className="w-full border-gray-200 border rounded-xl p-3 focus:ring-2 focus:ring-red-500 focus:outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          )}
          <input
            type="email"
            placeholder="Email"
            className="w-full border-gray-200 border rounded-xl p-3 focus:ring-2 focus:ring-red-500 focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full border-gray-200 border rounded-xl p-3 focus:ring-2 focus:ring-red-500 focus:outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-full transition-colors"
          >
            {isSignup ? 'Sign up' : 'Log in'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsSignup(!isSignup)}
            className="text-sm font-bold text-gray-700 hover:underline"
          >
            {isSignup ? 'Already a member? Log in' : 'Not on PinMeta yet? Sign up'}
          </button>
        </div>

        <button 
          onClick={onClose}
          className="w-full mt-4 text-sm text-gray-400 hover:text-gray-600"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default LoginModal;
