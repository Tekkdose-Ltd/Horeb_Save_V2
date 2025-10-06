import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Users, Calendar, DollarSign } from "lucide-react";

interface GroupCardProps {
  group: {
    id: string;
    name: string;
    description?: string;
    maxMembers: number;
    contributionAmount: string;
    frequency: string;
    status: string;
    currentRound?: number;
    totalRounds?: number;
    nextPayoutDate?: string;
    memberCount: number;
  };
  showActions?: boolean;
}

export function GroupCard({ group, showActions = false }: GroupCardProps) {
  const progress = group.totalRounds 
    ? ((group.currentRound || 1) / group.totalRounds) * 100 
    : 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-secondary/10 text-secondary">Active</Badge>;
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'completed':
        return <Badge className="bg-primary/10 text-primary">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatNextPayout = (dateString?: string) => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays <= 7) return `${diffDays} days`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div 
      className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
      data-testid={`card-group-${group.id}`}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-semibold text-lg" data-testid={`text-group-name-${group.id}`}>
            {group.name}
          </h4>
          <p className="text-sm text-muted-foreground">
            {group.memberCount}/{group.maxMembers} members • ${group.contributionAmount}/{group.frequency} • Started {group.status === 'active' ? 'Active' : 'Draft'}
          </p>
        </div>
        {getStatusBadge(group.status)}
      </div>
      
      {group.description && (
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {group.description}
        </p>
      )}
      
      {group.status === 'active' && group.totalRounds && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              Round {group.currentRound || 1} of {group.totalRounds}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span data-testid={`text-member-count-${group.id}`}>
              {group.memberCount}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <span>${group.contributionAmount}</span>
          </div>
        </div>
        
        <div className="text-right">
          {group.status === 'active' ? (
            <>
              <p className="text-sm text-muted-foreground">Next contribution</p>
              <p className="font-semibold text-accent" data-testid={`text-next-payout-${group.id}`}>
                {formatNextPayout(group.nextPayoutDate)}
              </p>
            </>
          ) : group.status === 'draft' ? (
            <>
              <p className="text-sm text-muted-foreground">Spots left</p>
              <p className="font-semibold text-primary">
                {group.maxMembers - group.memberCount}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Completed</p>
          )}
        </div>
      </div>

      {showActions && (
        <div className="flex gap-2 mt-4">
          <Button variant="outline" size="sm" className="flex-1" data-testid={`button-view-group-${group.id}`}>
            View Details
          </Button>
          {group.status === 'draft' && (
            <Button size="sm" className="flex-1" data-testid={`button-manage-group-${group.id}`}>
              Manage
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
