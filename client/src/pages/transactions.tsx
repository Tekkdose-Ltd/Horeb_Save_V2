import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  RefreshCw, 
  Calendar,
  PoundSterling,
  Download
} from "lucide-react";

export default function Transactions() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<string>("all");

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["/payment/transaction/my"],
    enabled: !!user,
    retry: false,
  });

  const { data: contributions } = useQuery({
    queryKey: ["/api/contributions/my"],
    retry: false,
  });

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'contribution':
        return <ArrowUpCircle className="w-5 h-5 text-destructive" />;
      case 'payout':
        return <ArrowDownCircle className="w-5 h-5 text-secondary" />;
      case 'refund':
        return <RefreshCw className="w-5 h-5 text-accent" />;
      default:
        return <PoundSterling className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case 'contribution':
        return 'Contribution';
      case 'payout':
        return 'Payout';
      case 'refund':
        return 'Refund';
      default:
        return 'Transaction';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-secondary/10 text-secondary">Paid</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredTransactions = Array.isArray(transactions) ? transactions.filter((transaction: any) => {
    if (filter === "all") return true;
    return transaction.type === filter;
  }) : [];

  const totalContributed = Array.isArray(transactions) ? transactions.reduce((sum: number, t: any) => 
    t.type === 'contribution' ? sum + Number(t.amount) : sum, 0) : 0;

  const totalReceived = Array.isArray(transactions) ? transactions.reduce((sum: number, t: any) => 
    t.type === 'payout' ? sum + Number(t.amount) : sum, 0) : 0;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar className="w-64" />
      
      {/* Main Content */}
      <div className="flex-1 min-w-0 pt-14 lg:pt-0">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2" data-testid="text-transactions-title">
              Transactions
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              View your complete transaction history and contribution records.
            </p>
          </div>
          <Button variant="outline" className="w-full sm:w-auto" data-testid="button-download-report">
            <Download className="w-4 h-4 mr-2" />
            Download Report
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="border-border" data-testid="card-total-contributed">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Contributed</p>
                  <p className="text-2xl font-bold text-destructive" data-testid="text-total-contributed">
                    £{totalContributed.toFixed(2)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center">
                  <ArrowUpCircle className="text-destructive text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border" data-testid="card-total-received">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Received</p>
                  <p className="text-2xl font-bold text-secondary" data-testid="text-total-received">
                    £{totalReceived.toFixed(2)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <ArrowDownCircle className="text-secondary text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border" data-testid="card-net-amount">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Net Amount</p>
                  <p className={`text-2xl font-bold ${
                    totalReceived - totalContributed >= 0 ? 'text-secondary' : 'text-destructive'
                  }`} data-testid="text-net-amount">
                    £{(totalReceived - totalContributed).toFixed(2)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <PoundSterling className="text-primary text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="transactions" className="space-y-6">
          <TabsList data-testid="tabs-transaction-history">
            <TabsTrigger value="transactions" data-testid="tab-transactions">All Transactions</TabsTrigger>
            <TabsTrigger value="contributions" data-testid="tab-contributions">Contributions</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-6">
            <Card className="border-border" data-testid="card-transactions-list">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Transaction History</h2>
                  <div className="flex gap-2">
                    <Button
                      variant={filter === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilter("all")}
                      data-testid="filter-all"
                    >
                      All
                    </Button>
                    <Button
                      variant={filter === "contribution" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilter("contribution")}
                      data-testid="filter-contributions"
                    >
                      Contributions
                    </Button>
                    <Button
                      variant={filter === "payout" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilter("payout")}
                      data-testid="filter-payouts"
                    >
                      Payouts
                    </Button>
                  </div>
                </div>

                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center space-x-4 p-4 border border-border rounded-lg animate-pulse">
                        <div className="w-10 h-10 bg-muted rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                        <div className="text-right">
                          <div className="h-4 bg-muted rounded w-16 mb-2"></div>
                          <div className="h-3 bg-muted rounded w-12"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredTransactions.length > 0 ? (
                  <div className="space-y-4">
                    {filteredTransactions.map((transaction: any) => (
                      <div 
                        key={transaction.id} 
                        className="flex items-center space-x-4 p-4 border border-border rounded-lg hover:shadow-sm transition-shadow"
                        data-testid={`transaction-${transaction.id}`}
                      >
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-muted">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium" data-testid={`transaction-label-${transaction.id}`}>
                              {getTransactionLabel(transaction.type)}
                            </p>
                            {transaction.round && (
                              <Badge variant="outline" className="text-xs">
                                Round {transaction.round}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground" data-testid={`transaction-description-${transaction.id}`}>
                            {transaction.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {new Date(transaction.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${
                            transaction.type === 'contribution' ? 'text-destructive' : 'text-secondary'
                          }`} data-testid={`transaction-amount-${transaction.id}`}>
                            {transaction.type === 'contribution' ? '-' : '+'}£{Number(transaction.amount).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12" data-testid="empty-transactions">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <PoundSterling className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No transactions found</h3>
                    <p className="text-muted-foreground">
                      {filter === "all" 
                        ? "You haven't made any transactions yet."
                        : `No ${filter} transactions found.`
                      }
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contributions" className="space-y-6">
            <Card className="border-border" data-testid="card-contributions-list">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-6">Contribution Schedule</h2>

                {Array.isArray(contributions) && contributions.length > 0 ? (
                  <div className="space-y-4">
                    {contributions.map((contribution: any) => (
                      <div 
                        key={contribution.id} 
                        className="flex items-center justify-between p-4 border border-border rounded-lg"
                        data-testid={`contribution-${contribution.id}`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-muted">
                            <PoundSterling className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">Round {contribution.round} Contribution</p>
                            <p className="text-sm text-muted-foreground">
                              Due: {new Date(contribution.dueDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="font-semibold">£{Number(contribution.amount).toFixed(2)}</p>
                          {getStatusBadge(contribution.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12" data-testid="empty-contributions">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No contributions scheduled</h3>
                    <p className="text-muted-foreground">
                      Join an active group to start making contributions.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </main>
      </div>
    </div>
  );
}
