import { Link, Route, Switch } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useToken } from "./lib/useToken";
import SettingsPage from "@/pages/settings-page";

function Navigation() {
  return (
    <div className="fixed top-4 right-4">
      <Link href="/settings">
        <Button variant="outline" size="icon">
          <Settings className="h-[1.2rem] w-[1.2rem]" />
        </Button>
      </Link>
    </div>
  );
}

function MainScreen() {
  const { token } = useToken();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4">
      <div className="text-center">
        {token ? (
          <p className="text-sm text-gray-600">Authentication token is active</p>
        ) : (
          <p className="text-sm text-gray-600">Please configure your credentials in settings</p>
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Navigation />
      <Switch>
        <Route path="/settings" component={SettingsPage} />
        <Route path="/" component={MainScreen} />
      </Switch>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;