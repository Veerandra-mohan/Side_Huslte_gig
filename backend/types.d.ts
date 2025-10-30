// File: backend/types.d.ts

// This tells TypeScript that the global Express 'Request' object
// can have an optional 'user' property, which can be any type.
declare global {
  namespace Express {
    export interface Request {
      user?: any;
    }
  }
}

// This empty export is required to make this file a module.
export {};
