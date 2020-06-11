import React, { createContext, useReducer } from 'react';
import { getFiles, uploadFile, deleteFile } from './google-api';

const AppStateContext = createContext();
const AppDispatchContext = createContext();

function appReducer(state, action) {
  console.log('appReducer', state, action);

  switch (action.type) {
    case 'LOAD_FILES_BEGIN': {
      return {
        ...state,
        loading: true,
        error: null,
      };
    }
    case 'LOAD_FILES_END': {
      return {
        ...state,
        loading: false,
        error: null,
        files: [...action.payload.files],
      };
    }
    case 'LOAD_FILES_ERROR': {
      return {
        ...state,
        loading: false,
        error: action.payload.error,
      };
    }
    case 'CLEAR_FILES': {
      return {
        ...state,
        files: [],
        selectedFileId: null,
      };
    }
    case 'SELECT_FILE': {
      return {
        ...state,
        selectedFileId: action.payload.fileId,
      };
    }
    default: {
      throw new Error(`Invalid action type: '${action.type}'`);
    }
  }
}

export function AppStateProvider({ children }) {
  const [appState, dispatch] = useReducer(appReducer, {
    files: [],
    selectedFileId: null,
    loading: undefined,
    error: null,
  });

  return (
    <AppStateContext.Provider value={appState}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const state = React.useContext(AppStateContext);
  if (state === undefined) {
    throw new Error('useAppState must be used within a AppStateProvider');
  }

  return state;
}

export function useAppActions() {
  const dispatch = React.useContext(AppDispatchContext);
  if (dispatch === undefined) {
    throw new Error('useAppDispatch must be used within a AppStateProvider');
  }

  return {
    loadFiles: async () => {
      dispatch({ type: 'LOAD_FILES_BEGIN' });

      try {
        const files = await getFiles();
        dispatch({ type: 'LOAD_FILES_END', payload: { files } });
      } catch (error) {
        dispatch({ type: 'LOAD_FILES_ERROR', payload: { error } });
      }
    },
    clearFiles: async () => {
      dispatch({ type: 'CLEAR_FILES' });
    },
    uploadFile: async ({ fileId, fileName, content }) => {
      dispatch({ type: 'LOAD_FILES_BEGIN' });

      try {
        const { id: uploadedFileId } = await uploadFile({
          fileId,
          fileName,
          content,
        });
        console.log('uploadFile() done:', uploadedFileId);

        const files = await getFiles();
        dispatch({ type: 'LOAD_FILES_END', payload: { files } });
        return uploadedFileId;
      } catch (error) {
        dispatch({ type: 'LOAD_FILES_ERROR', payload: { error } });
      }
    },

    selectFile: (fileId) => {
      dispatch({ type: 'SELECT_FILE', payload: { fileId } });
    },

    deleteFile: async (fileId) => {
      dispatch({ type: 'LOAD_FILES_BEGIN' });

      try {
        await deleteFile(fileId);
        dispatch({ type: 'SELECT_FILE', payload: { fileId: null } });

        const files = await getFiles();
        dispatch({ type: 'LOAD_FILES_END', payload: { files } });
      } catch (error) {
        dispatch({ type: 'LOAD_FILES_ERROR', payload: { error } });
      }
    },
  };
}
