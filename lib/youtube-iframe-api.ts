export type YouTubePlayerInstance = {
  destroy: () => void;
  getPlayerState: () => number;
  pauseVideo: () => void;
};

type YouTubeApi = {
  Player: new (
    element: HTMLIFrameElement,
    options: {
      events: {
        onReady: (event: { target: YouTubePlayerInstance }) => void;
        onStateChange: (event: { data: number }) => void;
        onAutoplayBlocked: () => void;
      };
    }
  ) => YouTubePlayerInstance;
};

declare global {
  interface Window {
    YT?: YouTubeApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<YouTubeApi> | null = null;

export function loadYouTubeIframeApi(): Promise<YouTubeApi> {
  if (window.YT?.Player) return Promise.resolve(window.YT);

  if (!apiPromise) {
    apiPromise = new Promise<YouTubeApi>((resolve, reject) => {
      const previousReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previousReady?.();
        if (window.YT?.Player) resolve(window.YT);
        else reject(new Error("No se pudo iniciar el reproductor de YouTube."));
      };

      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      script.onerror = () => reject(new Error("No se pudo cargar la API de YouTube."));
      document.head.appendChild(script);
    }).catch((error) => {
      apiPromise = null;
      throw error;
    });
  }

  return apiPromise;
}
