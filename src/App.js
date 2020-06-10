import React from 'react';
import { FileList } from './FileList';
import { FileContent } from './FileContent';
import { AuthProvider } from './auth-state';
import { AppStateProvider } from './app-state';
import { Header } from './Header';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <AppStateProvider>
        <div className="App">
          <Header />
          <FileList />
          <FileContent />
        </div>
      </AppStateProvider>
    </AuthProvider>
  );
}

export default App;
