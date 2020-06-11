import React, { createContext, useReducer, useEffect } from 'react';
import { init, signIn, signOut } from './google-api';

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
        userName: user.getBasicProfile().getName(),
        userId: user.getId(),
        userEmail: user.getBasicProfile().getEmail(),
      };
    }
    case 'SIGN_OUT': {
      return {
        ...state,
        isSignedIn: false,
        user: null,
        userName: '',
        userId: '',
        userEmail: '',
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
    userName: '',
    userId: '',
    userEmail: '',
  });

  useEffect(() => {
    init((user, error) => {
      if (error) {
        console.error(JSON.stringify(error, null, 2));
        return;
      }
      console.log('Google API initialized. user=', user);

      if (user && user.isSignedIn()) {
        dispatch({ type: 'SIGN_IN', payload: { user } });
      } else {
        dispatch({ type: 'SIGN_OUT' });
      }
    });
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
    throw new Error('useAuthState must be used within a AuthStateProvider');
  }

  const actions = {
    signIn: async () => {
      const user = await signIn();
      if (user && user.isSignedIn()) {
        dispatch({ type: 'SIGN_IN', payload: { user } });
      }
    },
    signOut: async () => {
      await signOut();
      dispatch({ type: 'SIGN_OUT' });
    },
  };

  return [state, actions];
}
