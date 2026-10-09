export type SpotifyEmbedController = {
  addListener: (
    event: "playback_update",
    callback: (event: { data: { isPaused: boolean } }) => void
  ) => void;
  pause: () => void;
  destroy: () => void;
};

type SpotifyIframeApi = {
  createController: (
    element: HTMLElement,
    options: { uri: string; width: string; height: number },
    callback: (controller: SpotifyEmbedController) => void
  ) => void;
};

declare global {
  interface Window {
    SpotifyIframeApi?: SpotifyIframeApi;
    onSpotifyIframeApiReady?: (api: SpotifyIframeApi) => void;
  }
}

let apiPromise: Promise<SpotifyIframeApi> | null = null;

export function loadSpotifyIframeApi(): Promise<SpotifyIframeApi> {
  if (window.SpotifyIframeApi) return Promise.resolve(window.SpotifyIframeApi);

  if (!apiPromise) {
    apiPromise = new Promise<SpotifyIframeApi>((resolve, reject) => {
      const previousReady = window.onSpotifyIframeApiReady;
      const timeout = window.setTimeout(() => reject(new Error("Spotify embed timed out.")), 8000);
      window.onSpotifyIframeApiReady = (api) => {
        previousReady?.(api);
        window.SpotifyIframeApi = api;
        window.clearTimeout(timeout);
        resolve(api);
      };

      const script = document.createElement("script");
      script.src = "https://open.spotify.com/embed/iframe-api/v1";
      script.async = true;
      script.onerror = () => {
        window.clearTimeout(timeout);
        reject(new Error("Spotify embed could not load."));
      };
      document.head.appendChild(script);
    }).catch((error) => {
      apiPromise = null;
      throw error;
    });
  }

  return apiPromise;
}
