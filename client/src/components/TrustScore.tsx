import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Star } from "lucide-react";

interface TrustScoreProps {
  stats?: {
    trustScore: number;
    onTimePaymentRate: number;
    completedGroups: number;
  };
}

export function TrustScore({ stats }: TrustScoreProps) {
  const trustScore = stats?.trustScore || 0;
  const onTimeRate = stats?.onTimePaymentRate || 0;
  const completedGroups = stats?.completedGroups || 0;

  const getTrustLevel = (score: number) => {
    if (score >= 4.5) return { label: "Excellent", color: "text-secondary" };
    if (score >= 4.0) return { label: "Very Good", color: "text-primary" };
    if (score >= 3.5) return { label: "Good", color: "text-accent" };
    if (score >= 3.0) return { label: "Fair", color: "text-muted-foreground" };
    return { label: "Building", color: "text-muted-foreground" };
  };

  const trustLevel = getTrustLevel(trustScore);

  return (
    <Card className="border-border" data-testid="card-trust-score">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Your Trust Profile</h3>
        
        <div className="text-center mb-4">
          <div className="w-20 h-20 mx-auto mb-3 relative">
            <div className="w-full h-full rounded-full border-8 border-muted"></div>
            <div 
              className="absolute inset-0 w-full h-full rounded-full border-8 border-secondary border-t-transparent transition-transform duration-500" 
              style={{ transform: `rotate(${(trustScore / 5) * 360}deg)` }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-secondary" data-testid="text-trust-score-value">
                {trustScore.toFixed(1)}
              </span>
            </div>
          </div>
          <p className={`text-sm font-medium ${trustLevel.color}`} data-testid="text-trust-level">
            {trustLevel.label} Trust Score
          </p>
        </div>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Payment History</span>
            <span className="text-secondary font-medium" data-testid="text-payment-history">
              {onTimeRate.toFixed(0)}% on-time
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Groups Completed</span>
            <span className="font-medium" data-testid="text-completed-groups">
              {completedGroups}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Member Since</span>
            <span className="font-medium">Jan 2024</span>
          </div>
        </div>

        {trustScore < 5.0 && (
          <div className="mt-4 p-3 bg-accent/5 border border-accent/20 rounded-lg">
            <div className="flex items-start space-x-2">
              <Star className="w-4 h-4 text-accent mt-0.5" />
              <div>
                <p className="text-sm font-medium text-accent-foreground">
                  Improve Your Score
                </p>
                <p className="text-xs text-muted-foreground">
                  Make payments on time and complete groups to boost your trust score.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
