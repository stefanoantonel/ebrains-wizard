
import axios from 'axios';
import { userInfo } from '@/store';
import { drive } from '@/constants';
import type {
  CollabItems, Collab, CollabDirectory,
  UploadFromUrl, UploadContent, UploadString,
} from '@/types/interfaces';

const { DRIVE_API_URL } = drive;

const axiosInstance = axios.create();

userInfo.subscribe((newUser: Oidc.User) => {
  axiosInstance.defaults.headers.Authorization = `Bearer ${newUser?.access_token}`;
});

function getAllCollabs(): Promise<Array<Collab>> {
  const endpoint = `${DRIVE_API_URL}/repos/`;
  return axiosInstance.get(endpoint).then(r => r.data);
}

export async function findMyCollabs(): Promise<Array<Collab>> {
  const collabs = await getAllCollabs();
  const foundCollab = collabs.filter(
    (collab: Collab) => collab.permission === 'rw',
  );
  return foundCollab;
}

export async function findCollabIdByName(collabName: string): Promise<string> {
  const collabs = await getAllCollabs();
  const foundCollab = collabs.find((collab: Collab) => collab.name === collabName);
  return foundCollab?.id;
}

async function findItems(collabId: string, isFolder = false): Promise<Array<string>> {
  const params = {
    t: isFolder ? 'd' : 'f',
    p: '/'
  };
  const endpoint = `${DRIVE_API_URL}/repos/${collabId}/dir/`;
  const response = await axiosInstance.get(endpoint, { params });
  const items = response.data;
  return items.map((item: CollabDirectory) => item.name);
}

export async function findItemsByCollabId(collabId: string): Promise<CollabItems> {
  const [ files, folders ] = await Promise.all([
    findItems(collabId, false),
    findItems(collabId, true),
  ]);

  return { files, folders };
}
    
export async function createFolder(collabId: string, folderName: string) {
  if (!folderName.startsWith('/')) {
    folderName = `/${folderName}`;
  }

  const existingFolders = await findItems(collabId, true);
  if (existingFolders.includes(folderName.replace(/\//g, ''))) return;

  const params = { 'p': folderName };
  // it is not a json payload but application/x-www-form-urlencoded
  const data = "operation=mkdir";
  const endpoint = `${DRIVE_API_URL}/repos/${collabId}/dir/`;

  return axiosInstance({
    method: 'post',
    url: endpoint,
    params,
    data,
  });
}

async function getUploadLink(collabId: string) : Promise<string> {
  const params = { 'p': '/' };
  const endpoint = `${DRIVE_API_URL}/repos/${collabId}/upload-link/`;
  const response = await axiosInstance.get(endpoint, { params });
  const uploadLink: string = response.data;
  return uploadLink;
}

export async function getFileContent(fileUrl: string) : Promise<Blob> {
  return axios({
    method: 'get',
    url: fileUrl,
    responseType: 'blob'
  }).then(response => response.data);
}

export async function getFileContentAndReplace(
  fileUrl: string, placeholder: string, newText: string
) : Promise<Blob> {
  const fileContent: Blob = await getFileContent(fileUrl);
  const originalType = fileContent.type;
  let textContent: string = await fileContent.text();
  if (textContent.includes(placeholder)) {
    textContent = textContent.replace(placeholder, newText);
  }
  return new Blob([textContent], {type: originalType});
}


export async function uploadFromUrl(uploadObj : UploadFromUrl) {
  let fetchFileFn = () => {
    if (uploadObj.placeholder && uploadObj.newText) {
      return getFileContentAndReplace(
        uploadObj.fileUrl,
        uploadObj.placeholder,
        uploadObj.newText
      );
    }
    return getFileContent(uploadObj.fileUrl);
  };
  const [uploadLink, fileContent, _] = await Promise.all([
    getUploadLink(uploadObj.collabId),
    fetchFileFn(),
    createFolder(uploadObj.collabId, uploadObj.parentFolder),
  ]);
  const fileName = uploadObj.fileName || decodeURIComponent(uploadObj.fileUrl.split('/').pop());

  return uploadContent({
    parentFolder: uploadObj.parentFolder,
    uploadLink,
    fileContent,
    fileName,
  });
}

export async function uploadContent(obj: UploadContent) {
  const formData = new FormData();
  formData.append('file', obj.fileContent, obj.fileName);
  formData.append('filename', 'test2.txt');
  formData.append('file_name', 'test2.txt');
  formData.append('name', 'test2.txt');
  formData.append('replace', '1'),
  formData.append('ret-json', '1'),
  formData.append('parent_dir', obj.parentFolder);
  return axiosInstance.post(obj.uploadLink, formData);
}

export async function uploadString(uploadObj: UploadString) {
  const [uploadLink, _] = await Promise.all([
    getUploadLink(uploadObj.collabId),
    createFolder(uploadObj.collabId, uploadObj.parentFolder),
  ]);

  return uploadContent({
    uploadLink,
    parentFolder: uploadObj.parentFolder,
    fileName: uploadObj.fileName,
    fileContent: new Blob(
      [ uploadObj.stringContent ],
      { type: uploadObj.type || 'text/plain' },
    ),
  });
}

export async function search(query: string) {
  // not supported yet
  const endpoint = `${DRIVE_API_URL}/search/`;
  const params = {
    q: 'antonel',
  }
  return axiosInstance.get(endpoint, { params }).then(r => r.data);
}

export async function getFileFromCollab(collabId: string, filePath: string) {
  // make sure it starts with /
  const params = { 'p': filePath.startsWith('/') ? filePath : `/${filePath}` };
  const endpoint = `${DRIVE_API_URL}/repos/${collabId}/file/`;
  try {
    const response = await axiosInstance.get(endpoint, { params });
    const downloadUrl: string = response.data;
    const fileContentBlob = await getFileContent(downloadUrl);
    const textContent = await fileContentBlob.text();
    return textContent;
  } catch {
    return null;
  }
}

export default {};