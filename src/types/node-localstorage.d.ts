declare module 'node-localstorage' {
  interface LocalStorageClass {
    new (location: string, quota?: number): Storage;
  }

  let exports: {
    LocalStorage: LocalStorageClass;
  };

  export = exports;
}
