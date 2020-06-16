import React, { createContext, useReducer, useEffect } from 'react';
import { initAuth, signIn, signOut } from './google-api';

const AuthStateContext = createContext();

function authReducer(state, action) {
  console.log('authReducer', state, action);

  switch (action.type) {
    case 'SIGN_IN': {
      const user = action.payload.user;
      return {
        ...state,
        isSignedIn: true,
        user: user,
        userId: user.getId(),
        userName: user.getBasicProfile().getName(),
        userEmail: user.getBasicProfile().getEmail(),
        error: null,
      };
    }
    case 'SIGN_OUT': {
      return {
        ...state,
        isSignedIn: false,
        user: null,
        userId: '',
        userName: '',
        userEmail: '',
        error: null,
      };
    }
    case 'AUTH_ERROR': {
      return {
        ...state,
        error: action.payload.error,
      };
    }
    default: {
      throw new Error(`Invalid action type: '${action.type}'`);
    }
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, {
    isSignedIn: undefined,
    user: undefined,
    userId: '',
    userName: '',
    userEmail: '',
    error: null,
  });

  useEffect(() => {
    (async () => {
      try {
        const user = await initAuth();
        if (user && user.isSignedIn()) {
          dispatch({ type: 'SIGN_IN', payload: { user } });
        } else {
          dispatch({ type: 'SIGN_OUT' });
        }
      } catch (error) {
        console.error(error);
        dispatch({ type: 'AUTH_ERROR', payload: { error } });
      }
    })();
  }, []);

  return (
    <AuthStateContext.Provider value={[state, dispatch]}>
      {children}
    </AuthStateContext.Provider>
  );
}

export function useAuthState() {
  const [state, dispatch] = React.useContext(AuthStateContext);
  if (state === undefined) {
    throw new Error('useAuthState must be used within AuthProvider');
  }

  function catchError(func) {
    return async (...args) => {
      try {
        await func(...args);
      } catch (error) {
        dispatch({ type: 'AUTH_ERROR', payload: { error } });
      }
    };
  }

  const actions = {
    signIn: catchError(async () => {
      const user = await signIn();
      if (user && user.isSignedIn()) {
        dispatch({ type: 'SIGN_IN', payload: { user } });
      }
    }),
    signOut: catchError(async () => {
      await signOut();
      dispatch({ type: 'SIGN_OUT' });
    }),
  };

  return [state, actions];
}
