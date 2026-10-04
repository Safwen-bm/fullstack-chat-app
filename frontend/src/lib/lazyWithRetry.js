import { lazy } from "react";

/*
  React.lazy that survives a new deploy: if the old chunk no longer exists
  (the visitor kept a tab open), reload the page once to get the new files.
*/
export function lazyWithRetry(factory) {
  return lazy(async () => {
    try {
      const module = await factory();
      sessionStorage.removeItem("chunk-reload");
      return module;
    } catch (error) {
      if (!sessionStorage.getItem("chunk-reload")) {
        sessionStorage.setItem("chunk-reload", "1");
        window.location.reload();
        return new Promise(() => {}); // wait for the reload
      }
      throw error;
    }
  });
}