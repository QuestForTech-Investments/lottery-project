/// <reference types="vite/client" />

// Vite resolves these asset imports to a URL string at build time. Declared
// here so TypeScript treats `import video from './foo.mp4'` as a string.
declare module '*.mp4' {
  const src: string;
  export default src;
}

declare module '*.webm' {
  const src: string;
  export default src;
}
