# Member Rating & Payout Rotation API Documentation

## Overview
This document outlines all API endpoints needed for the Payout Rotation and Member Rating features in Horeb Save.

---

## Payout Rotation Endpoints

### 1. Get User's Payout Schedule
**Endpoint:** `GET /api/groups/my-payout-schedule`

**Description:** Returns the authenticated user's upcoming payout information across all groups.

**Response:**
```json
{
  "nextPayout": {
    "groupId": "uuid",
    "groupName": "Tech Professionals Circle",
    "date": "2024-12-15T00:00:00Z",
    "amount": 5000,
    "rotationNumber": 3
  },
  "groups": [
    {
      "id": "uuid",
      "name": "Tech Professionals Circle",
      "contributionAmount": 500,
      "frequency": "monthly",
      "currentRotation": 3,
      "totalRotations": 10,
      "members": [...]
    }
  ]
}
```

---

### 2. Get Group Payout Rotation Details
**Endpoint:** `GET /api/groups/:groupId/payout-rotation`

**Description:** Returns detailed payout rotation schedule for a specific group.

**Parameters:**
- `groupId` (path): UUID of the group

**Response:**
```json
{
  "id": "uuid",
  "name": "Tech Professionals Circle",
  "contributionAmount": 500,
  "frequency": "monthly",
  "currentRotation": 3,
  "totalRotations": 10,
  "members": [
    {
      "id": "user-uuid",
      "name": "Alice Johnson",
      "avatarUrl": "https://...",
      "rotationNumber": 1,
      "payoutDate": "2024-10-15T00:00:00Z",
      "payoutAmount": 5000,
      "status": "completed"
    },
    {
      "id": "user-uuid",
      "name": "Bob Smith",
      "avatarUrl": null,
      "rotationNumber": 2,
      "payoutDate": "2024-11-15T00:00:00Z",
      "payoutAmount": 5000,
      "status": "completed"
    },
    {
      "id": "user-uuid",
      "name": "Carol Davis",
      "avatarUrl": "https://...",
      "rotationNumber": 3,
      "payoutDate": "2024-12-15T00:00:00Z",
      "payoutAmount": 5000,
      "status": "current"
    }
  ]
}
```

**Status Values:**
- `completed`: Payout has been processed
- `current`: Next member to receive payout
- `upcoming`: Future rotation

---

### 3. Get Member Profile in Group
**Endpoint:** `GET /api/groups/:groupId/members/:memberId`

**Description:** Returns detailed profile of a member within a specific group context.

**Parameters:**
- `groupId` (path): UUID of the group
- `memberId` (path): UUID of the member

**Response:**
```json
{
  "id": "user-uuid",
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "avatarUrl": "https://...",
  "trustScore": 85.5,
  "joinedAt": "2024-01-15T00:00:00Z",
  "rotationNumber": 1,
  "payoutStatus": "completed",
  "contributionHistory": [
    {
      "date": "2024-10-01T00:00:00Z",
      "amount": 500,
      "status": "paid"
    },
    {
      "date": "2024-11-01T00:00:00Z",
      "amount": 500,
      "status": "paid"
    }
  ],
  "averageRating": 4.5,
  "totalRatings": 8,
  "canRateThisMember": true
}
```

---

## Member Rating Endpoints

### 4. Submit Member Rating
**Endpoint:** `POST /api/groups/:groupId/members/:memberId/rating`

**Description:** Submit a rating for a group member. Can only rate after their rotation completes.

**Parameters:**
- `groupId` (path): UUID of the group
- `memberId` (path): UUID of the member being rated

**Request Body:**
```json
{
  "rating": 5,
  "feedback": "Excellent member, always on time with contributions!",
  "categories": {
    "reliability": 5,
    "communication": 5,
    "trustworthiness": 5
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Rating submitted successfully",
  "newAverageRating": 4.7,
  "updatedTrustScore": 87.3
}
```

**Validation Rules:**
- User must be authenticated
- User must be a member of the group
- User cannot rate themselves
- Can only rate once per member per rotation cycle
- Rating values must be between 1-5
- Can only rate after rotation completes

**Error Responses:**
- `400`: Invalid rating values
- `403`: Cannot rate yourself or not in same group
- `404`: Group or member not found
- `409`: Already rated this member in current rotation

---

### 5. Get Member Ratings
**Endpoint:** `GET /api/groups/:groupId/members/:memberId/ratings`

**Description:** Retrieve all ratings for a specific member in a group.

**Parameters:**
- `groupId` (path): UUID of the group
- `memberId` (path): UUID of the member
- `page` (query, optional): Page number (default: 1)
- `limit` (query, optional): Items per page (default: 10)
- `sortBy` (query, optional): Sort by "date" or "rating" (default: "date")

**Response:**
```json
{
  "ratings": [
    {
      "id": "rating-uuid",
      "rating": 5,
      "feedback": "Great member!",
      "categories": {
        "reliability": 5,
        "communication": 5,
        "trustworthiness": 5
      },
      "ratedBy": {
        "id": "user-uuid",
        "name": "Bob Smith",
        "avatarUrl": "https://..."
      },
      "createdAt": "2024-11-01T12:00:00Z",
      "groupName": "Tech Professionals Circle"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  },
  "summary": {
    "averageRating": 4.5,
    "totalRatings": 25,
    "categoryAverages": {
      "reliability": 4.6,
      "communication": 4.4,
      "trustworthiness": 4.5
    }
  }
}
```

---

### 6. Update Member Rating
**Endpoint:** `PUT /api/groups/:groupId/members/:memberId/rating/:ratingId`

**Description:** Update an existing rating. Only allowed within 48 hours of submission.

**Parameters:**
- `groupId` (path): UUID of the group
- `memberId` (path): UUID of the member
- `ratingId` (path): UUID of the rating

**Request Body:**
```json
{
  "rating": 4,
  "feedback": "Updated feedback",
  "categories": {
    "reliability": 4,
    "communication": 5,
    "trustworthiness": 4
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Rating updated successfully"
}
```

**Validation Rules:**
- User can only update their own ratings
- Can only update within 48 hours of submission
- Same validation rules as submission

---

### 7. Delete Member Rating
**Endpoint:** `DELETE /api/groups/:groupId/members/:memberId/rating/:ratingId`

**Description:** Delete a rating. Only allowed within 48 hours of submission.

**Parameters:**
- `groupId` (path): UUID of the group
- `memberId` (path): UUID of the member
- `ratingId` (path): UUID of the rating

**Response:**
```json
{
  "success": true,
  "message": "Rating deleted successfully"
}
```

**Validation Rules:**
- User can only delete their own ratings
- Can only delete within 48 hours of submission

---

### 8. Get My Ratings Given
**Endpoint:** `GET /api/user/ratings/given`

**Description:** Get all ratings the authenticated user has given to others.

**Parameters:**
- `page` (query, optional): Page number (default: 1)
- `limit` (query, optional): Items per page (default: 10)

**Response:**
```json
{
  "ratings": [
    {
      "id": "rating-uuid",
      "rating": 5,
      "feedback": "Excellent member",
      "ratedMember": {
        "id": "user-uuid",
        "name": "Alice Johnson",
        "avatarUrl": "https://..."
      },
      "groupName": "Tech Professionals Circle",
      "createdAt": "2024-11-01T12:00:00Z"
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 10,
    "totalPages": 2
  }
}
```

---

### 9. Get My Ratings Received
**Endpoint:** `GET /api/user/ratings/received`

**Description:** Get all ratings the authenticated user has received.

**Parameters:**
- `page` (query, optional): Page number (default: 1)
- `limit` (query, optional): Items per page (default: 10)

**Response:**
```json
{
  "ratings": [
    {
      "id": "rating-uuid",
      "rating": 5,
      "feedback": "Great to work with!",
      "categories": {
        "reliability": 5,
        "communication": 5,
        "trustworthiness": 5
      },
      "ratedBy": {
        "name": "Bob Smith",
        "avatarUrl": "https://..."
      },
      "groupName": "Tech Professionals Circle",
      "createdAt": "2024-11-01T12:00:00Z"
    }
  ],
  "summary": {
    "averageRating": 4.5,
    "totalRatings": 12,
    "categoryAverages": {
      "reliability": 4.6,
      "communication": 4.4,
      "trustworthiness": 4.5
    }
  },
  "pagination": {
    "total": 12,
    "page": 1,
    "limit": 10,
    "totalPages": 2
  }
}
```

---

## Database Schema

### Member Ratings Table
```sql
CREATE TABLE member_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id),
  rated_user_id VARCHAR NOT NULL REFERENCES users(id),
  rated_by_user_id VARCHAR NOT NULL REFERENCES users(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  reliability_rating INTEGER NOT NULL CHECK (reliability_rating >= 1 AND reliability_rating <= 5),
  communication_rating INTEGER NOT NULL CHECK (communication_rating >= 1 AND communication_rating <= 5),
  trustworthiness_rating INTEGER NOT NULL CHECK (trustworthiness_rating >= 1 AND trustworthiness_rating <= 5),
  rotation_number INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(group_id, rated_user_id, rated_by_user_id, rotation_number),
  CHECK (rated_user_id != rated_by_user_id)
);

CREATE INDEX idx_member_ratings_group ON member_ratings(group_id);
CREATE INDEX idx_member_ratings_rated_user ON member_ratings(rated_user_id);
CREATE INDEX idx_member_ratings_rated_by ON member_ratings(rated_by_user_id);
```

### Payout Rotations Table
```sql
CREATE TABLE payout_rotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id),
  user_id VARCHAR NOT NULL REFERENCES users(id),
  rotation_number INTEGER NOT NULL,
  payout_date TIMESTAMP NOT NULL,
  payout_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR NOT NULL CHECK (status IN ('pending', 'completed', 'upcoming')),
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(group_id, rotation_number)
);

CREATE INDEX idx_payout_rotations_group ON payout_rotations(group_id);
CREATE INDEX idx_payout_rotations_user ON payout_rotations(user_id);
CREATE INDEX idx_payout_rotations_date ON payout_rotations(payout_date);
```

---

## Business Rules & Logic

### Rating Permissions
1. Users can only rate members in groups they belong to
2. Cannot rate yourself
3. Can only rate after a member's rotation is completed
4. One rating per member per rotation cycle
5. Can update/delete rating within 48 hours

### Trust Score Calculation
The trust score should be calculated based on:
- Average of all ratings received (weighted 60%)
- Payment history and on-time rate (weighted 30%)
- Number of successful rotations completed (weighted 10%)

Formula example:
```
trustScore = (averageRating * 12) + (onTimePaymentRate * 0.3) + (completedRotations * 0.1)
```

### Rating Visibility
- Individual ratings: Visible to member, rater, and group admins
- Average ratings: Public within the group
- Detailed feedback: Visible based on user privacy settings
- Anonymous ratings: Option in user settings (shows "Anonymous Member" instead of name)

---

## Frontend Components Created

1. **MemberRatingModal** (`/components/MemberRatingModal.tsx`)
   - Modal for submitting ratings
   - Star rating interface
   - Category ratings (Reliability, Communication, Trustworthiness)
   - Feedback textarea

2. **MemberRatingsView** (`/components/MemberRatingsView.tsx`)
   - View all ratings for a member
   - Rating summary with averages
   - Category breakdown with progress bars
   - Individual rating cards

3. **PayoutRotation** (`/components/PayoutRotation.tsx`)
   - Displays payout schedule
   - Group selector dropdown
   - Member list with rotation status
   - Integrated "Rate Member" button

---

## Testing Checklist

### Backend
- [ ] Create payout rotation records when group is formed
- [ ] Update rotation status automatically on payout dates
- [ ] Validate rating permissions (same group, not self, rotation complete)
- [ ] Prevent duplicate ratings for same rotation
- [ ] Calculate trust score updates on new ratings
- [ ] Test 48-hour edit/delete window
- [ ] Test pagination on rating lists
- [ ] Test rating summary calculations

### Frontend
- [ ] Rating modal opens when clicking star icon
- [ ] All star ratings work correctly
- [ ] Form validation prevents incomplete submissions
- [ ] Success toast appears after rating submission
- [ ] Payout rotation updates after rating
- [ ] Ratings view modal displays correctly
- [ ] Empty state shows when no ratings exist
- [ ] Loading states work properly

---

## Notes for Backend Developer

1. **Rotation Status Updates**: Implement a scheduled job (cron/worker) to update payout rotation statuses daily
2. **Trust Score Recalculation**: Trigger trust score updates whenever a new rating is submitted
3. **Notification System**: Send notifications when a user receives a new rating
4. **Rate Limiting**: Implement rate limiting on rating submission to prevent abuse
5. **Data Privacy**: Respect user privacy settings for anonymous ratings
6. **Audit Logging**: Log all rating submissions, updates, and deletions for accountability

---

## Future Enhancements

1. **Dispute Resolution**: Allow members to dispute unfair ratings
2. **Rating Response**: Allow rated members to respond to feedback
3. **Verified Ratings**: Badge for ratings from verified/trusted members
4. **Rating Analytics**: Dashboard showing rating trends over time
5. **Group Rating Average**: Show overall group satisfaction score
6. **Export Ratings**: Allow users to export their rating history

