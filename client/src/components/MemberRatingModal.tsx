import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, ThumbsUp, MessageSquare, Shield, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

/**
 * Types for Member Rating
 * TODO: Move these to shared/schema.ts when backend is ready
 */
interface MemberToRate {
  id: string;
  name: string;
  avatarUrl?: string;
  rotationNumber: number;
  trustScore?: string;
}

interface RatingCategories {
  reliability: number;
  communication: number;
  trustworthiness: number;
}

interface MemberRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: MemberToRate | null;
  groupId: string;
  groupName: string;
}

export function MemberRatingModal({
  isOpen,
  onClose,
  member,
  groupId,
  groupName,
}: MemberRatingModalProps) {
  const { toast } = useToast();
  const [overallRating, setOverallRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [categories, setCategories] = useState<RatingCategories>({
    reliability: 0,
    communication: 0,
    trustworthiness: 0,
  });
  const [feedback, setFeedback] = useState("");

  const submitRatingMutation = useMutation({
    mutationFn: async (data: {
      rating: number;
      feedback: string;
      categories: RatingCategories;
    }) => {
      const response = await fetch(
        `/api/groups/${groupId}/members/${member?.id}/rating`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit rating");
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Rating Submitted",
        description: `Your rating for ${member?.name} has been recorded.`,
      });
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: [`/api/groups/${groupId}/payout-rotation`] });
      queryClient.invalidateQueries({ queryKey: [`/api/groups/${groupId}/members/${member?.id}`] });
      handleClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setOverallRating(0);
    setCategories({
      reliability: 0,
      communication: 0,
      trustworthiness: 0,
    });
    setFeedback("");
    onClose();
  };

  const handleSubmit = () => {
    if (overallRating === 0) {
      toast({
        title: "Rating Required",
        description: "Please provide an overall rating.",
        variant: "destructive",
      });
      return;
    }

    if (
      categories.reliability === 0 ||
      categories.communication === 0 ||
      categories.trustworthiness === 0
    ) {
      toast({
        title: "Complete All Ratings",
        description: "Please rate all categories.",
        variant: "destructive",
      });
      return;
    }

    submitRatingMutation.mutate({
      rating: overallRating,
      feedback,
      categories,
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const renderStars = (
    rating: number,
    onRate: (value: number) => void,
    hovered: number = 0,
    onHover: (value: number) => void = () => {}
  ) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => onRate(value)}
            onMouseEnter={() => onHover(value)}
            onMouseLeave={() => onHover(0)}
            className="transition-transform hover:scale-110 focus:outline-none"
          >
            <Star
              className={`w-6 h-6 ${
                value <= (hovered || rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
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

  const categoryDescriptions = {
    reliability: "Did they make contributions on time?",
    communication: "How responsive and clear were they?",
    trustworthiness: "Would you trust them in future groups?",
  };

  if (!member) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">Rate Group Member</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>
            Share your experience with {member.name} in {groupName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Member Info */}
          <div className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg">
            <Avatar className="h-16 w-16">
              <AvatarImage src={member.avatarUrl} />
              <AvatarFallback className="text-lg">
                {getInitials(member.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">{member.name}</h3>
              <p className="text-sm text-muted-foreground">
                Rotation #{member.rotationNumber}
              </p>
              {member.trustScore && (
                <p className="text-sm text-muted-foreground">
                  Trust Score: {member.trustScore}
                </p>
              )}
            </div>
          </div>

          {/* Overall Rating */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-semibold">
                Overall Rating <span className="text-destructive">*</span>
              </label>
              <p className="text-xs text-muted-foreground mb-2">
                How would you rate your overall experience?
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {renderStars(
                overallRating,
                setOverallRating,
                hoveredRating,
                setHoveredRating
              )}
              {overallRating > 0 && (
                <span className="text-sm font-medium text-muted-foreground">
                  {overallRating}/5
                </span>
              )}
            </div>
          </div>

          {/* Category Ratings */}
          <div className="space-y-4">
            <label className="text-sm font-semibold">
              Detailed Ratings <span className="text-destructive">*</span>
            </label>
            {Object.entries(categories).map(([key, value]) => {
              const Icon = categoryIcons[key as keyof RatingCategories];
              return (
                <div
                  key={key}
                  className="p-4 border border-border rounded-lg space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <Icon className="w-5 h-5 text-primary" />
                    <h4 className="font-medium">
                      {categoryLabels[key as keyof RatingCategories]}
                    </h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {categoryDescriptions[key as keyof RatingCategories]}
                  </p>
                  <div className="flex items-center space-x-3">
                    {renderStars(value, (rating) =>
                      setCategories({ ...categories, [key]: rating })
                    )}
                    {value > 0 && (
                      <span className="text-sm font-medium text-muted-foreground">
                        {value}/5
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Feedback */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">
              Additional Feedback <span className="text-muted-foreground">(Optional)</span>
            </label>
            <Textarea
              placeholder="Share any additional thoughts about this member's participation..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Your feedback helps build trust in the community
            </p>
          </div>

          {/* Privacy Notice */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-900">
              <strong>Privacy:</strong> Your rating will be visible to the member
              and group admins. Your identity will be shown unless you opt for
              anonymous ratings in your settings.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={submitRatingMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1"
              disabled={submitRatingMutation.isPending}
            >
              {submitRatingMutation.isPending ? "Submitting..." : "Submit Rating"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * API Integration Guide
 * =====================
 * 
 * Backend Endpoint:
 * POST /api/groups/:groupId/members/:memberId/rating
 * 
 * Request Body:
 * {
 *   "rating": number (1-5),
 *   "feedback": string (optional),
 *   "categories": {
 *     "reliability": number (1-5),
 *     "communication": number (1-5),
 *     "trustworthiness": number (1-5)
 *   }
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Rating submitted successfully",
 *   "newAverageRating": number,
 *   "updatedTrustScore": number
 * }
 * 
 * Error Responses:
 * - 400: Invalid rating values
 * - 403: Cannot rate yourself or not in same group
 * - 409: Already rated this member in current rotation
 * 
 * Usage Example:
 * 
 * import { MemberRatingModal } from "@/components/MemberRatingModal";
 * 
 * const [selectedMember, setSelectedMember] = useState<MemberToRate | null>(null);
 * 
 * <MemberRatingModal
 *   isOpen={!!selectedMember}
 *   onClose={() => setSelectedMember(null)}
 *   member={selectedMember}
 *   groupId={currentGroupId}
 *   groupName={currentGroupName}
 * />
 */
