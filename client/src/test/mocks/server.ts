import { setupServer } from "msw/node";
import { handlers } from "./handlers";

// Spin up an in-process MSW server (no Service Worker needed in Node/jsdom)
export const server = setupServer(...handlers);
