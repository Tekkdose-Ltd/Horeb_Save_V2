import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Rating {
  id: string;
  group_id: string;
  member_id: string;
  trust_rating: number;
  description?: string;
  rated_by: string;
  rater_name?: string;
  group_name?: string;
  createdAt: string;
}

interface RecentRatingsProps {
  ratings?: Rating[];
  isLoading?: boolean;
}

export function RecentRatings({ ratings, isLoading }: RecentRatingsProps) {
  const getInitials = (name: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTimeAgo = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return "Recently";
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex space-x-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3.5 h-3.5 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">Recent Ratings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-muted rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!ratings || ratings.length === 0) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">Recent Ratings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Star className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-20" />
            <p className="text-sm text-muted-foreground">
              No ratings yet. Rate your group members to build trust!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show only latest 3 ratings
  const recentRatings = ratings.slice(0, 3);

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Recent Ratings</span>
          <span className="text-xs font-normal text-muted-foreground">
            Latest 3
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentRatings.map((rating) => (
            <div
              key={rating.id}
              className="border border-border rounded-lg p-3 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-start space-x-3">
                {/* Rater Avatar */}
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {getInitials(rating.rater_name || "User")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  {/* Rater Name & Time */}
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-sm font-medium truncate">
                      {rating.rater_name || "Anonymous User"}
                    </p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {formatTimeAgo(rating.createdAt)}
                    </span>
                  </div>

                  {/* Stars */}
                  <div className="flex items-center space-x-2 mb-2">
                    {renderStars(rating.trust_rating)}
                    <span className="text-xs font-medium text-muted-foreground">
                      {rating.trust_rating}/5
                    </span>
                  </div>

                  {/* Group Name */}
                  {rating.group_name && (
                    <p className="text-xs text-muted-foreground mb-2">
                      in <span className="font-medium">{rating.group_name}</span>
                    </p>
                  )}

                  {/* Feedback */}
                  {rating.description && (
                    <div className="bg-muted/50 rounded-md p-2 mt-2">
                      <p className="text-xs text-muted-foreground italic line-clamp-2">
                        "{rating.description}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Link */}
        {ratings.length > 3 && (
          <div className="mt-4 text-center">
            <button className="text-xs text-primary hover:text-primary/80 font-medium">
              View all {ratings.length} ratings →
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * API Integration
 * ===============
 * 
 * This component expects ratings data from:
 * GET /api/v1/horebSave/user/ratings/received
 * 
 * Response should include:
 * - Rating details (score, description)
 * - Rater information (name)
 * - Group information (name)
 * - Timestamp
 * 
 * The component automatically shows only the 3 most recent ratings
 * sorted by createdAt (newest first)
 */
