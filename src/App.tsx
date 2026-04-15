import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import { DEFAULT_SCENE_ID } from "@/lib/scenes";
import AuthPanel, { SESSION_KEY } from "@/components/AuthPanel";

const queryClient = new QueryClient();

const getSceneKey = (username: string) => `vibe-user:${username}:scene`;

const App = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [currentScene, setCurrentScene] = useState(DEFAULT_SCENE_ID);

  useEffect(() => {
    const sessionUser = localStorage.getItem(SESSION_KEY);
    if (sessionUser) {
      setCurrentUser(sessionUser);
      const savedScene = localStorage.getItem(getSceneKey(sessionUser));
      if (savedScene) setCurrentScene(savedScene);
    }
  }, []);

  const handleLoginSuccess = (username: string) => {
    setCurrentUser(username);
    const savedScene = localStorage.getItem(getSceneKey(username));
    setCurrentScene(savedScene || DEFAULT_SCENE_ID);
  };

  const handleSceneChange = (sceneId: string) => {
    setCurrentScene(sceneId);
    if (currentUser) {
      localStorage.setItem(getSceneKey(currentUser), sceneId);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                currentUser ? (
                  <Index
                    key={currentUser}
                    currentUser={currentUser}
                    currentSceneId={currentScene}
                    onSceneChange={handleSceneChange}
                    onLogout={handleLogout}
                  />
                ) : (
                  <AuthPanel onLoginSuccess={handleLoginSuccess} />
                )
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
