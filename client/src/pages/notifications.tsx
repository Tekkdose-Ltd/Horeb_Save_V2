import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle, AlertCircle, Info, DollarSign } from "lucide-react";

export default function Notifications() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Commented out notifications API call - no backend endpoint yet
  // const { data: notifications, isLoading: notificationsLoading } = useQuery({
  //   queryKey: ["/notifications"],
  //   retry: false,
  // });
  
  // Mock empty notifications for now
  const notifications = [];
  const notificationsLoading = false;

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await apiRequest("POST", `/notifications/${notificationId}/read`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/notifications"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/notifications/mark-all-read");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/notifications"] });
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    },
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'payment_due':
      case 'payment_failed':
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      case 'payment_received':
      case 'payout_ready':
        return <CheckCircle className="w-5 h-5 text-secondary" />;
      case 'group_started':
      case 'group_joined':
        return <Info className="w-5 h-5 text-primary" />;
      default:
        return <Bell className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const unreadNotifications = Array.isArray(notifications) ? notifications.filter((n: any) => !n.isRead) : [];
  const readNotifications = Array.isArray(notifications) ? notifications.filter((n: any) => n.isRead) : [];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar className="w-64" />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-notifications-title">
              Notifications
            </h1>
            <p className="text-muted-foreground">
              Stay updated with your groups and transactions.
            </p>
          </div>
          {unreadNotifications.length > 0 && (
            <Button 
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
              data-testid="button-mark-all-read"
            >
              Mark All as Read
            </Button>
          )}
        </div>

        {notificationsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-border">
                <CardContent className="p-4 animate-pulse">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-muted rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : Array.isArray(notifications) && notifications.length > 0 ? (
          <div className="space-y-6">
            {unreadNotifications.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Unread</h2>
                <div className="space-y-4">
                  {unreadNotifications.map((notification: any) => (
                    <Card 
                      key={notification.id} 
                      className="border-primary/30 bg-primary/5"
                      data-testid={`notification-unread-${notification.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-4">
                          <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center flex-shrink-0">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-1">
                              <h3 className="font-semibold text-foreground" data-testid={`notification-title-${notification.id}`}>
                                {notification.title}
                              </h3>
                              <Badge variant="secondary" className="ml-2">New</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2" data-testid={`notification-message-${notification.id}`}>
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-muted-foreground">
                                {new Date(notification.createdAt).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => markAsReadMutation.mutate(notification.id)}
                                disabled={markAsReadMutation.isPending}
                                data-testid={`button-mark-read-${notification.id}`}
                              >
                                Mark as read
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {readNotifications.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Earlier</h2>
                <div className="space-y-4">
                  {readNotifications.map((notification: any) => (
                    <Card 
                      key={notification.id} 
                      className="border-border opacity-75"
                      data-testid={`notification-read-${notification.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-4">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground mb-1" data-testid={`notification-title-${notification.id}`}>
                              {notification.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-2" data-testid={`notification-message-${notification.id}`}>
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(notification.createdAt).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <Card className="border-border" data-testid="card-no-notifications">
            <CardContent className="p-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No notifications</h3>
                <p className="text-muted-foreground">
                  You're all caught up! Check back later for updates.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        </main>
      </div>
    </div>
  );
}
