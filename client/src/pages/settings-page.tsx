import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { useToken } from "@/lib/useToken";

const settingsSchema = z.object({
  rememberCredentials: z.boolean(),
  username: z.string().optional(),
  password: z.string().optional(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const [timeUntilRefresh, setTimeUntilRefresh] = useState<string>("");
  const { token, refreshToken } = useToken();

  const [tokenInfo, setTokenInfo] = useState<{ token: string; timestamp: number } | null>(null);

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      rememberCredentials: false,
      username: "",
      password: "",
    },
  });

  // Load saved settings on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('authSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      form.reset(settings);
    }

    const savedToken = localStorage.getItem('authToken');
    if (savedToken) {
      setTokenInfo(JSON.parse(savedToken));
    }
  }, []);

  // Update time until refresh every minute
  useEffect(() => {
    if (!tokenInfo?.timestamp) return;

    const updateTimeUntilRefresh = () => {
      const tokenDate = new Date(tokenInfo.timestamp);
      const refreshDate = new Date(tokenDate.getTime() + 23 * 60 * 60 * 1000);
      setTimeUntilRefresh(formatDistanceToNow(refreshDate));
    };

    updateTimeUntilRefresh();
    const interval = setInterval(updateTimeUntilRefresh, 60000);
    return () => clearInterval(interval);
  }, [tokenInfo?.timestamp]);

  const onSubmit = async (data: SettingsFormData) => {
    setIsLoading(true);
    try {
      if (data.rememberCredentials) {
        localStorage.setItem('authSettings', JSON.stringify(data));
      } else {
        localStorage.removeItem('authSettings');
      }

      toast({
        title: "Settings saved",
        description: "Your authentication preferences have been updated",
      });

      // Navigate back to the previous page
      setTimeout(() => {
        setLocation('/');
      }, 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setLocation('/');
  };

  const handleRefreshToken = async () => {
    try {
      const newToken = await refreshToken();
      // Update local token info state
      const savedToken = localStorage.getItem('authToken');
      if (savedToken) {
        setTokenInfo(JSON.parse(savedToken));
        toast({
          title: "Token Refreshed",
          description: "Successfully obtained a new authentication token",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh token",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-4"
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle className="text-2xl font-bold">Settings</CardTitle>
          <CardDescription>
            Manage your authentication preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tokenInfo && (
            <div className="mb-6 p-4 bg-slate-50 rounded-lg border">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium">Current Authentication Token</h3>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleRefreshToken}
                  title="Refresh Token"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-gray-600 break-all mb-2">{tokenInfo.token}</p>
              <div className="space-y-1">
                <p className="text-xs text-gray-500">
                  Generated: {format(new Date(tokenInfo.timestamp), 'PPpp')}
                </p>
                <p className="text-xs text-gray-500">
                  Auto-refresh in: {timeUntilRefresh}
                </p>
              </div>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="rememberCredentials"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Remember Credentials</FormLabel>
                      <FormDescription>
                        Save your login information for next time
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {form.watch("rememberCredentials") && (
                <>
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter username to save" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter password to save"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <div className="flex gap-4">
                <Button type="button" variant="outline" className="w-full" onClick={handleBack}>
                  Cancel
                </Button>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  Save Settings
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}