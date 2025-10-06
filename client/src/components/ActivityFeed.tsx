import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  UserPlus, 
  DollarSign, 
  ArrowUpCircle, 
  ArrowDownCircle,
  RefreshCw 
} from "lucide-react";

interface Transaction {
  id: string;
  type: string;
  amount: string;
  description: string;
  createdAt: string;
  round?: number;
}

interface ActivityFeedProps {
  transactions?: Transaction[];
}

export function ActivityFeed({ transactions = [] }: ActivityFeedProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'contribution':
        return <ArrowUpCircle className="text-destructive text-xs" />;
      case 'payout':
        return <ArrowDownCircle className="text-secondary text-xs" />;
      case 'refund':
        return <RefreshCw className="text-accent text-xs" />;
      default:
        return <DollarSign className="text-muted-foreground text-xs" />;
    }
  };

  const getActivityLabel = (type: string) => {
    switch (type) {
      case 'contribution':
        return 'Contribution sent';
      case 'payout':
        return 'Payout received';
      case 'refund':
        return 'Refund processed';
      default:
        return 'Transaction processed';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  const recentTransactions = transactions.slice(0, 3);

  return (
    <Card className="border-border" data-testid="card-activity-feed">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        
        <div className="space-y-4">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((transaction) => (
              <div 
                key={transaction.id} 
                className="flex items-start space-x-3"
                data-testid={`activity-${transaction.id}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  transaction.type === 'contribution' 
                    ? 'bg-destructive/10' 
                    : transaction.type === 'payout'
                    ? 'bg-secondary/10'
                    : 'bg-accent/10'
                }`}>
                  {getActivityIcon(transaction.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground" data-testid={`activity-label-${transaction.id}`}>
                    {getActivityLabel(transaction.type)}
                  </p>
                  <p className="text-xs text-muted-foreground truncate" data-testid={`activity-description-${transaction.id}`}>
                    {transaction.description}
                  </p>
                  <p className="text-xs text-muted-foreground" data-testid={`activity-time-${transaction.id}`}>
                    {formatTimeAgo(transaction.createdAt)}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-sm font-medium ${
                    transaction.type === 'contribution' ? 'text-destructive' : 'text-secondary'
                  }`} data-testid={`activity-amount-${transaction.id}`}>
                    {transaction.type === 'contribution' ? '-' : '+'}${Number(transaction.amount).toFixed(2)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6" data-testid="empty-activity-feed">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                <DollarSign className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No recent activity</p>
            </div>
          )}
        </div>

        {transactions.length > 3 && (
          <div className="mt-4 pt-4 border-t border-border">
            <Button variant="ghost" size="sm" className="w-full text-primary hover:text-primary/80" data-testid="button-view-all-activity">
              View All Activity
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
