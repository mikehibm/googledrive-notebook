import React, { useState, useEffect, useCallback } from 'react';
import { useAuthState } from './auth-state';
import { useAppActions, useAppState } from './app-state';
import { getFileContent } from './google-api';
import './FileContent.css';

export function FileContent() {
  const [fileId, setFileId] = useState('');
  const [fileName, setFilename] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(undefined);

  const [authState] = useAuthState();
  const { isSignedIn } = authState;

  const { uploadFile, selectFile, deleteFile } = useAppActions();
  const appState = useAppState();
  const { selectedFileId } = appState;

  const loadContent = useCallback(async () => {
    setLoading(true);
    const data = await getFileContent(selectedFileId);
    console.log('getFileContent -> data', data);
    setFileId(data.fileId);
    setFilename(data.name);
    setContent(data.content);
    setLoading(false);
  }, [selectedFileId]);

  useEffect(() => {
    if (selectedFileId !== fileId) {
      loadContent();
    }
  }, [selectedFileId, fileId, loadContent]);

  async function handleUpload() {
    const inputFileName = prompt(
      'Please input a filename. Enter blank to cancel.',
      fileName
    );
    if (!inputFileName) return;

    setLoading(true);
    const id = await uploadFile({
      fileId: selectedFileId,
      fileName: inputFileName,
      content,
    });

    setFilename(inputFileName);
    selectFile(id);
    setLoading(false);
  }

  async function handleReload() {
    if (!selectedFileId) {
      setContent('');
      return;
    }

    loadContent();
  }

  async function handleDelete() {
    if (!selectedFileId) {
      setContent('');
      return;
    }
    // eslint-disable-next-line no-restricted-globals
    if (!confirm('Are you sure to delete this file?')) return;

    setLoading(true);
    await deleteFile(selectedFileId);
    setLoading(false);
  }

  if (!isSignedIn) {
    return null;
  }

  return (
    <div className="FileContent">
      <header className="FileContent-header">
        <div className="filename">{fileName}</div>
        <button
          id="btn-reload"
          onClick={handleReload}
          disabled={loading || !selectedFileId}
        >
          Reload
        </button>
        <button
          id="btn-delete"
          onClick={handleDelete}
          disabled={loading || !selectedFileId}
        >
          Delete
        </button>
      </header>
      <textarea
        name="content"
        id="content"
        cols="30"
        rows="10"
        placeholder="テキストを入力してください。"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={loading}
      />

      <div className="buttons">
        <button id="btn-save" onClick={handleUpload} disabled={loading}>
          Save
        </button>
      </div>
    </div>
  );
}
