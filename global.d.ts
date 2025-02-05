export { };


declare global {
  declare module 'dirty-json'

  interface Blob {
    toPNG(callback?: () => void): Promise<Blob | undefined>
    toWebP(callback?: () => void): Promise<Blob | undefined>
    toJPEG(callback?: () => void): Promise<Blob | undefined>
    addOrUpdateExifData(userComment: string): Promise<Blob>
  }

  interface Window {
    gapi: {
      load: (api: string, callback: () => void) => void;
      client: {
        init: (config: {
          apiKey: string;
          discoveryDocs: string[];
        }) => Promise<void>;
        getToken: () => { access_token: string, expires_in: number } | null;
        setToken: (token: { access_token: string }) => void;
        drive: {
          files: {
            create: (params: {
              resource: DriveFileResource;
              media?: DriveFileMedia;
              fields: string;
              uploadType?: string;
            }) => Promise<{ result: { id: string; name: string } }>;
            list: (params: DriveListParams) => Promise<{
              result: {
                files: Array<{ id: string; name: string }>;
              };
            }>;
          };
        };
      };
    };
    google: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: {
              expires_in?: number;
              access_token?: string;
              error?: string;
            }) => void;
          }) => {
            requestAccessToken: (params?: { prompt?: string }) => void;
          };
          revoke: (token: string) => void;
        };
      };
    };
  }
}