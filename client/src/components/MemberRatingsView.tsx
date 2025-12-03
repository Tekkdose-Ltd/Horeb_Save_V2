import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Star, ThumbsUp, MessageSquare, Shield, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface MemberRatingsViewProps {
  isOpen: boolean;
  onClose: () => void;
  memberId: string;
  memberName: string;
  groupId: string;
}

interface Rating {
  id: string;
  rating: number;
  feedback: string | null;
  categories: {
    reliability: number;
    communication: number;
    trustworthiness: number;
  };
  ratedBy: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  createdAt: string;
  groupName: string;
}

interface RatingSummary {
  averageRating: number;
  totalRatings: number;
  categoryAverages: {
    reliability: number;
    communication: number;
    trustworthiness: number;
  };
}

export function MemberRatingsView({
  isOpen,
  onClose,
  memberId,
  memberName,
  groupId,
}: MemberRatingsViewProps) {
  // Fetch member ratings
  const { data: ratingsData, isLoading } = useQuery<{
    ratings: Rating[];
    summary: RatingSummary;
  }>({
    queryKey: [`/api/groups/${groupId}/members/${memberId}/ratings`],
    enabled: isOpen && !!memberId,
    retry: false,
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex space-x-0.5">
        {[1, 2, 3, 4, 5].map((value) => (
          <Star
            key={value}
            className={`w-4 h-4 ${
              value <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const categoryIcons = {
    reliability: ThumbsUp,
    communication: MessageSquare,
    trustworthiness: Shield,
  };

  const categoryLabels = {
    reliability: "Reliability",
    communication: "Communication",
    trustworthiness: "Trustworthiness",
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">Member Ratings</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>
            Ratings and feedback for {memberName}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : ratingsData && ratingsData.ratings.length > 0 ? (
          <div className="space-y-6 py-4">
            {/* Summary Section */}
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Overall Rating */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                    Overall Rating
                  </h3>
                  <div className="flex items-center space-x-3">
                    <div className="text-4xl font-bold text-primary">
                      {ratingsData.summary.averageRating.toFixed(1)}
                    </div>
                    <div>
                      {renderStars(Math.round(ratingsData.summary.averageRating))}
                      <p className="text-xs text-muted-foreground mt-1">
                        Based on {ratingsData.summary.totalRatings} rating
                        {ratingsData.summary.totalRatings !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Category Breakdown */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                    Category Breakdown
                  </h3>
                  {Object.entries(ratingsData.summary.categoryAverages).map(
                    ([key, value]) => {
                      const Icon =
                        categoryIcons[key as keyof typeof categoryIcons];
                      return (
                        <div key={key} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-2">
                              <Icon className="w-4 h-4 text-primary" />
                              <span>
                                {categoryLabels[key as keyof typeof categoryLabels]}
                              </span>
                            </div>
                            <span className="font-medium">{value.toFixed(1)}/5</span>
                          </div>
                          <Progress value={value * 20} className="h-2" />
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </div>

            {/* Individual Ratings */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Recent Reviews ({ratingsData.ratings.length})
              </h3>

              {ratingsData.ratings.map((rating) => (
                <div
                  key={rating.id}
                  className="border border-border rounded-lg p-4 space-y-3"
                >
                  {/* Rating Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={rating.ratedBy.avatarUrl} />
                        <AvatarFallback className="text-xs">
                          {getInitials(rating.ratedBy.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">
                          {rating.ratedBy.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(rating.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {renderStars(rating.rating)}
                      <span className="font-semibold text-sm">
                        {rating.rating}/5
                      </span>
                    </div>
                  </div>

                  {/* Category Ratings */}
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(rating.categories).map(([key, value]) => {
                      const Icon =
                        categoryIcons[key as keyof typeof categoryIcons];
                      return (
                        <Badge
                          key={key}
                          variant="outline"
                          className="text-xs space-x-1"
                        >
                          <Icon className="w-3 h-3" />
                          <span>
                            {categoryLabels[key as keyof typeof categoryLabels]}:
                          </span>
                          <span className="font-semibold">{value}/5</span>
                        </Badge>
                      );
                    })}
                  </div>

                  {/* Feedback */}
                  {rating.feedback && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-sm text-foreground italic">
                        "{rating.feedback}"
                      </p>
                    </div>
                  )}

                  {/* Group Badge */}
                  <div className="pt-2 border-t">
                    <Badge variant="secondary" className="text-xs">
                      From: {rating.groupName}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-12 text-center">
            <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No Ratings Yet</h3>
            <p className="text-sm text-muted-foreground">
              {memberName} hasn't received any ratings in this group yet.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/**
 * API Integration Guide
 * =====================
 * 
 * Backend Endpoint:
 * GET /api/groups/:groupId/members/:memberId/ratings
 * 
 * Response:
 * {
 *   "ratings": [
 *     {
 *       "id": "string",
 *       "rating": number,
 *       "feedback": "string | null",
 *       "categories": {
 *         "reliability": number,
 *         "communication": number,
 *         "trustworthiness": number
 *       },
 *       "ratedBy": {
 *         "id": "string",
 *         "name": "string",
 *         "avatarUrl": "string | null"
 *       },
 *       "createdAt": "ISO 8601 date",
 *       "groupName": "string"
 *     }
 *   ],
 *   "summary": {
 *     "averageRating": number,
 *     "totalRatings": number,
 *     "categoryAverages": {
 *       "reliability": number,
 *       "communication": number,
 *       "trustworthiness": number
 *     }
 *   }
 * }
 * 
 * Usage Example:
 * 
 * import { MemberRatingsView } from "@/components/MemberRatingsView";
 * 
 * <MemberRatingsView
 *   isOpen={showRatings}
 *   onClose={() => setShowRatings(false)}
 *   memberId={selectedMemberId}
 *   memberName={selectedMemberName}
 *   groupId={currentGroupId}
 * />
 */
