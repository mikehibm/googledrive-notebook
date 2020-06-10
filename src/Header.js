import React from 'react';
import { useAuthState } from './auth-state';
import './Header.css';

export function Header() {
  const [authState, authActions] = useAuthState();
  const { isSignedIn, userName, userEmail } = authState;

  return (
    <header className="Header">
      <h1>Google Drive Notebook Example</h1>
      <div className="user">
        {isSignedIn ? (
          <>
            <span>
              {userName} ({userEmail})
            </span>
            <button onClick={authActions.signOut}>Sign Out</button>
          </>
        ) : (
          <span>
            {isSignedIn === false ? (
              <button onClick={authActions.signIn}>Sign In</button>
            ) : (
              <span>Loading...</span>
            )}
          </span>
        )}
      </div>
    </header>
  );
}
