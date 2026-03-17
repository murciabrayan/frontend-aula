import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  fetchLandingContent,
  type LandingContentPayload,
} from "./landing.api";

const emptyLandingContent: LandingContentPayload = {
  news: [],
  gallery: [],
  documents: [],
  calendar_entries: [],
};

interface LandingContentContextValue {
  content: LandingContentPayload;
  isLoading: boolean;
  refreshLandingContent: () => Promise<void>;
}

const LandingContentContext = createContext<LandingContentContextValue | undefined>(undefined);

export const LandingContentProvider = ({ children }: { children: ReactNode }) => {
  const [content, setContent] = useState<LandingContentPayload>(emptyLandingContent);
  const [isLoading, setIsLoading] = useState(true);

  const refreshLandingContent = async () => {
    try {
      setIsLoading(true);
      const data = await fetchLandingContent();
      setContent(data);
    } catch (error) {
      console.error("Error loading landing content:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refreshLandingContent();
  }, []);

  const value = useMemo(
    () => ({
      content,
      isLoading,
      refreshLandingContent,
    }),
    [content, isLoading],
  );

  return <LandingContentContext.Provider value={value}>{children}</LandingContentContext.Provider>;
};

export const useLandingContent = () => {
  const context = useContext(LandingContentContext);

  if (!context) {
    throw new Error("useLandingContent must be used within a LandingContentProvider");
  }

  return context;
};
