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
import { queryClient, createTrustRating } from "@/lib/queryClient";

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
      // Call the new backend API
      const response = await createTrustRating({
        group_id: groupId,
        group_member_id: member?.id || '',
        rating_score: data.rating,
        description: data.feedback || undefined,
      });
      return response;
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

    // Only submit overall rating - other fields are UI-only
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
          <DialogTitle className="text-2xl">Rate Group Member</DialogTitle>
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
              Detailed Ratings <span className="text-muted-foreground"></span>
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
 * ✅ INTEGRATED WITH BACKEND (Dec 15, 2024)
 * 
 * Backend Endpoint:
 * POST /api/v1/horebSave/groups/rating
 * 
 * Request Body:
 * {
 *   "group_id": string,
 *   "group_member_id": string,
 *   "rating_score": number (1-5),
 *   "description": string (optional)
 * }
 * 
 * Response (201):
 * {
 *   "title": "New Group Trust Rating Message",
 *   "status": 201,
 *   "successful": true,
 *   "message": "Group trust rating created successfully.",
 *   "data": {
 *     "group_id": string,
 *     "member_id": string,
 *     "trust_rating": number,
 *     "description": string,
 *     "rated_by": string,
 *     "createdAt": timestamp,
 *     "updatedAt": timestamp
 *   }
 * }
 * 
 * Error Responses:
 * - 400: Invalid group or group member
 * - 401: Unauthorized (no token)
 * - 500: Internal server error
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
