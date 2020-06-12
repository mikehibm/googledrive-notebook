import React, { useEffect, useCallback, useReducer, useRef } from 'react';
import { useAuthState } from './auth-state';
import { useAppActions, useAppState } from './app-state';
import { getFileContent } from './google-api';
import './FileContent.css';

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD_FILE': {
      return {
        ...state,
        fileName: action.payload.fileName,
        content: action.payload.content,
        loading: false,
      };
    }
    case 'SET_FILENAME': {
      return {
        ...state,
        fileName: action.payload.fileName,
      };
    }
    case 'SET_CONTENT': {
      return {
        ...state,
        content: action.payload.content,
      };
    }
    case 'SET_LOADING': {
      return {
        ...state,
        loading: action.payload.loading,
      };
    }
    default:
      throw new Error(`Invalid action type '${action.type}'`);
  }
}

export function FileContent() {
  const [state, dispatch] = useReducer(reducer, {
    fileName: '',
    content: '',
    loading: undefined,
  });
  const { fileName, content, loading } = state;

  const [authState] = useAuthState();
  const { isSignedIn } = authState;

  const { uploadFile, selectFile, deleteFile } = useAppActions();
  const appState = useAppState();
  const { selectedFileId } = appState;

  const loadContent = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: { loading: true } });

    const data = await getFileContent(selectedFileId);

    dispatch({
      type: 'LOAD_FILE',
      payload: {
        fileName: data.name,
        content: data.content,
      },
    });
  }, [selectedFileId]);

  useEffect(() => {
    loadContent();
  }, [selectedFileId, loadContent]);

  async function handleUpload() {
    const inputFileName = prompt(
      'Please input a filename. Enter blank to cancel.',
      fileName
    );
    if (!inputFileName) return;

    dispatch({ type: 'SET_LOADING', payload: { loading: true } });
    const id = await uploadFile({
      fileId: selectedFileId,
      fileName: inputFileName,
      content,
    });

    dispatch({ type: 'SET_FILENAME', payload: { fileName: inputFileName } });
    dispatch({ type: 'SET_LOADING', payload: { loading: false } });
    selectFile(id);
  }

  async function handleReload() {
    if (!selectedFileId) {
      dispatch({ type: 'SET_CONTENT', payload: { content: '' } });
      return;
    }

    loadContent();
  }

  async function handleDelete() {
    if (!selectedFileId) {
      dispatch({ type: 'SET_CONTENT', payload: { content: '' } });
      return;
    }
    // eslint-disable-next-line no-restricted-globals
    if (!confirm('Are you sure to delete this file?')) return;

    dispatch({ type: 'SET_LOADING', payload: { loading: true } });
    await deleteFile(selectedFileId);
    dispatch({ type: 'SET_LOADING', payload: { loading: false } });
  }

  function handleChange(e) {
    dispatch({ type: 'SET_CONTENT', payload: { content: e.target.value } });
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
        cols={30}
        rows={10}
        placeholder="テキストを入力してください。"
        value={content}
        onChange={handleChange}
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
