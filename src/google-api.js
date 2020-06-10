/* eslint-disable no-undef */

export async function init(onInit) {
  const gapi = window.gapi;
  if (!gapi) return;

  gapi.load('client:auth2', initClient);

  async function initClient() {
    const initConfig = {
      apiKey: GOOGLE_API_KEY,
      clientId: GOOGLE_CLIENT_ID,
      discoveryDocs: DISCOVERY_DOCS,
      scope: SCOPES,
    };

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

export async function getFiles() {
  return gapi.client.drive.files
    .list({
      pageSize: 100,
      fields: 'nextPageToken, files(id, name)',
    })
    .then(function (response) {
      return response.result.files;
    });
}

export async function uploadFile(filename = 'tempdata', content = '') {
  console.log('Uploading...');

  const id = ''; //'1swKOjaOguzsH5jdfWjE35d-UWtNcpaQ0';
  var data = {
    content,
    name: 'Mike 3333',
    accounts: [
      { id: 1, name: 'Account 1', data: ['aaaa', 'bbb'] },
      { id: 2, name: 'Account-2' },
      { id: 3, name: 'Account-3', data: [123, 4324, 55, 666, 7777, 888] },
    ],
  };
  var file = new Blob([JSON.stringify(data)], {
    type: 'application/json',
  });
  var metadata = {
    name: filename, // Filename at Google Drive
    mimeType: 'application/json', // mimeType at Google Drive
    //parents: ['### folder ID ###'], // Folder ID at Google Drive
  };

  var accessToken = gapi.auth.getToken().access_token; // Here gapi is used for retrieving the access token.
  var form = new FormData();
  form.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json' })
  );
  form.append('file', file);

  return fetch(UPLOAD_URL + '/' + id + UPLOAD_PARAMS, {
    method: id ? 'PATCH' : 'POST',
    headers: new Headers({ Authorization: 'Bearer ' + accessToken }),
    body: form,
  })
    .then((res) => {
      return res.json();
    })
    .then(function (fileId) {
      console.log('UPLOADED:', fileId);
    });
}
