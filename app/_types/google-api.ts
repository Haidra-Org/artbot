export interface DriveFileResource {
  name: string;
  parents?: string[];
  mimeType?: string;
}

export interface DriveFileMedia {
  mimeType?: string;
  body: Blob | string;
}

export interface DriveListParams {
  pageSize?: number;
  fields: string;
  q?: string;
  spaces?: string;
}

export interface GoogleAuthState {
  isSignedIn: boolean;
  user: { name: string; email: string } | null;
  gapiInited: boolean;
  gisInited: boolean;
}

export interface DriveFile {
  id: string;
  name: string;
}

export const GOOGLE_API_CONFIG = {
  API_KEY: (process.env.NODE_ENV === 'development' ? process.env.NEXT_PUBLIC_DEV_GOOGLE_CLOUD_KEY : 'AIzaSyD1eYeuYWH3MFmRKd7-oB8C_fozA2KWJwU') || '',
  CLIENT_ID: '773317214900-qo83bui0bdh2kdkhkn6iafq2uvb1dsdr.apps.googleusercontent.com',
  DISCOVERY_DOC: 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
  SCOPES: 'https://www.googleapis.com/auth/drive.file'
} as const;