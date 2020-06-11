import React, { useEffect, useState } from 'react';
import { useAppState, useAppActions } from './app-state';
import { useAuthState } from './auth-state';
import './FileList.css';

export function FileList() {
  const [userId, setUserId] = useState(null);
  const { files, loading, error } = useAppState();
  const { loadFiles, clearFiles, selectFile } = useAppActions();
  const [authState] = useAuthState();
  const { isSignedIn, userId: newUserId } = authState;

  useEffect(() => {
    if (isSignedIn && newUserId !== userId) {
      setUserId(newUserId);
      loadFiles();
    } else if (!isSignedIn && files.length > 0) {
      setUserId(newUserId);
      clearFiles();
    }
  }, [isSignedIn, newUserId, userId, files.length, loadFiles, clearFiles]);

  if (!isSignedIn) {
    return (
      <div className="FileList">
        <div className="loading">Please sign in...</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="FileList">
        <div className="loading">Loading files...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="FileList">
        <div className="error">{error.message}</div>
      </div>
    );
  }

  return (
    <div className="FileList">
      <div className="list">
        <button onClick={() => selectFile(null)}>Create new</button>
        {files.map((i) => (
          <div key={i.id} onClick={() => selectFile(i.id)}>
            {i.name}
          </div>
        ))}
      </div>
    </div>
  );
}
