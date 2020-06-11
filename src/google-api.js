/* eslint-disable no-undef */

const DISCOVERY_DOCS = [
  'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
];
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

const UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files';
const UPLOAD_PARAMS = '?uploadType=multipart&fields=id';
const APP_FOLDER = 'Notebook-dev2020';

// apiKey and clientId are defined in index.html
const initConfig = {
  apiKey: GOOGLE_API_KEY,
  clientId: GOOGLE_CLIENT_ID,
  discoveryDocs: DISCOVERY_DOCS,
  scope: SCOPES,
};

export async function init(onInit) {
  if (!gapi) return;

  gapi.load('client:auth2', initClient);

  async function initClient() {
    try {
      await gapi.client.init(initConfig);

      const user = gapi.auth2.getAuthInstance().currentUser.get();
      onInit && onInit(user);
    } catch (error) {
      onInit && onInit(null, error);
    }
  }
}

export async function signIn() {
  return gapi.auth2.getAuthInstance().signIn();
}

export async function signOut() {
  return gapi.auth2.getAuthInstance().signOut();
}

async function getFolders(folderName) {
  const response = await gapi.client.drive.files.list({
    q: `mimeType = 'application/vnd.google-apps.folder' and name = '${folderName}' and trashed = false`,
    pageSize: 100,
    fields: 'nextPageToken, files(id, name)',
  });
  return response?.result?.files;
}

async function findOrCreateFolderId(folderName) {
  const folders = await getFolders(folderName);
  let folderId = folders[0]?.id;
  console.log(`Folder '${folderName}' id=${folderId}`);

  if (!folderId) {
    console.log(`Folder '${folderName}' not found. Creating...`);
    folderId = await createFolder(folderName);
    console.log(`Folder '${folderName}' created. id=${folderId}`);
  }
  return folderId;
}

async function createFolder(folderName) {
  const metadata = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
  };

  const response = await gapi.client.drive.files.create({
    resource: metadata,
    fields: 'id',
  });

  console.log('createFolder', response);
  return response.result.id;
}

export async function getFiles() {
  let parentFolderId = await findOrCreateFolderId(APP_FOLDER);

  const params = {
    q: `mimeType != 'application/vnd.google-apps.folder' and trashed = false`,
    pageSize: 100,
    fields: 'nextPageToken, files(id, name)',
  };

  if (parentFolderId) {
    params['q'] = params['q'] + ` and '${parentFolderId}' in parents`;
  }

  const response = await gapi.client.drive.files.list(params);
  return response.result.files;
}

export async function getFileInfo(fileId) {
  if (!fileId) return;

  const params = {
    fileId,
    fields: 'id,name,createdTime,modifiedTime,webContentLink',
  };
  const response = await gapi.client.drive.files.get(params);
  console.log('getFileContent', response);
  return response.result;
}

export async function getFileContent(fileId) {
  if (!fileId) return { fileId: '', name: 'New File', content: '' };

  const accessToken = gapi.auth.getToken().access_token;
  const info = await getFileInfo(fileId);
  // const url = info.webContentLink;   // webContentLink didn't work because of CORS restriction.
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&source=downloadUrl`;

  const response = await fetch(url, {
    method: 'GET',
    headers: new Headers({ Authorization: 'Bearer ' + accessToken }),
  });

  const content = await response.text();
  return { fileId, name: info.name, content };
}

export async function uploadFile({
  fileId = '',
  fileName = 'New File',
  content = '',
}) {
  console.log('Uploading...');

  if (!fileName.endsWith('.txt')) fileName = fileName + '.txt';

  let parentFolderId = await findOrCreateFolderId(APP_FOLDER);

  const file = new Blob([content], { type: 'text/plain' });
  const metadata = {
    name: fileName,
    mimeType: 'text/plain',
  };
  if (parentFolderId && !fileId) {
    metadata['parents'] = [parentFolderId];
  }

  const accessToken = gapi.auth.getToken().access_token;
  const form = new FormData();
  form.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json' })
  );
  form.append('file', file);

  const url = UPLOAD_URL + (fileId ? '/' + fileId : '') + UPLOAD_PARAMS;

  const res = await fetch(url, {
    method: fileId ? 'PATCH' : 'POST',
    headers: new Headers({ Authorization: 'Bearer ' + accessToken }),
    body: form,
  });
  const uploadedFileId = await res.json();
  return uploadedFileId;
}

export async function deleteFile(fileId) {
  if (!fileId) return { fileId: '', name: 'New File', content: '' };

  const accessToken = gapi.auth.getToken().access_token;
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: new Headers({ Authorization: 'Bearer ' + accessToken }),
  });
  if (response.ok) {
    return { fileId };
  } else {
    throw new Error(`${response.status} ${response.statusText}`);
  }
}
