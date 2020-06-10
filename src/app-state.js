import React, { createContext, useReducer, useEffect } from 'react';
import { getFiles } from './google-api';
import { useAuthState } from './auth-state';

const AppStateContext = createContext();
const AppDispatchContext = createContext();

function appReducer(state, action) {
  console.log('appReducer', state, action);

  switch (action.type) {
    case 'LOAD_FILES': {
      return {
        ...state,
        files: [...action.payload.files],
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
  });

  const [authState] = useAuthState();

  useEffect(() => {
    if (authState.isSignedIn === true && appState.files.length === 0) {
      loadFiles(dispatch);
    }
  }, [authState.isSignedIn, appState.files.length]);

  return (
    <AppStateContext.Provider value={appState}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
}

async function loadFiles(dispatch) {
  const files = await getFiles();
  dispatch({ type: 'LOAD_FILES', payload: { files } });
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
    loadFiles: () => {
      loadFiles(dispatch);
    },
  };
}
