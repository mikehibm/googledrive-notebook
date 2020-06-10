import React from 'react';
import { uploadFile } from './google-api';
import './FileContent.css';

export function FileContent() {
  function upload() {
    uploadFile('data.json', 'テストデータ');
  }

  return (
    <div className="FileContent">
      <header className="FileContent-header">
        <h2>File: aaaaaaaa.txt</h2>
      </header>
      <textarea
        name="content"
        id="content"
        cols="30"
        rows="10"
        defaultValue="これはテストです。"
      />

      <div className="buttons">
        <button id="btn-reload">Reload</button>
        <button id="btn-save" onClick={upload}>
          Save
        </button>
        <button id="btn-delete">Delete</button>
        <button id="btn-new">New</button>
      </div>
    </div>
  );
}
