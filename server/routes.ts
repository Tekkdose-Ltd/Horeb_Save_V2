import type { Express } from "express";
import { createServer, type Server } from "http";

/**
 * STUB ROUTES FILE
 * 
 * This file contains minimal stub endpoints that return placeholder data.
 * The frontend is fully functional and ready to consume real APIs.
 * 
 * Replace these stubs with your actual backend implementation.
 */

export async function registerRoutes(app: Express): Promise<Server> {
  
  // ==================== HEALTH CHECK ====================
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      message: "Frontend-only mode - Backend ready for implementation",
      timestamp: new Date().toISOString(),
    });
  });

  // ==================== AUTHENTICATION ENDPOINTS ====================
  
  // Get current user (stub)
  app.get("/api/auth/user", (req, res) => {
    res.status(401).json({ 
      message: "No authentication configured - Backend implementation needed" 
    });
  });

  // Login endpoint (stub)
  app.post("/api/auth/login", (req, res) => {
    res.status(501).json({ 
      message: "Login endpoint not implemented - Add your auth here" 
    });
  });

  // Register endpoint (stub)
  app.post("/api/auth/register", (req, res) => {
    res.status(501).json({ 
      message: "Register endpoint not implemented - Add your auth here" 
    });
  });

  // Logout endpoint (stub)
  app.post("/api/auth/logout", (req, res) => {
    res.status(501).json({ 
      message: "Logout endpoint not implemented" 
    });
  });

  // Update profile (stub)
  app.put("/api/auth/profile", (req, res) => {
    res.status(501).json({ 
      message: "Profile update not implemented" 
    });
  });

  // ==================== USER ENDPOINTS ====================
  
  // Get user stats (stub)
  app.get("/api/user/stats", (req, res) => {
    res.status(501).json({ 
      message: "User stats endpoint not implemented" 
    });
  });

  // ==================== GROUPS ENDPOINTS ====================
  
  // Get user's groups (stub)
  app.get("/api/groups/my", (req, res) => {
    res.status(501).json({ 
      message: "My groups endpoint not implemented" 
    });
  });

  // Get public groups (stub)
  app.get("/api/groups/public", (req, res) => {
    res.status(501).json({ 
      message: "Public groups endpoint not implemented" 
    });
  });

  // Create group (stub)
  app.post("/api/groups", (req, res) => {
    res.status(501).json({ 
      message: "Create group endpoint not implemented" 
    });
  });

  // Get group details (stub)
  app.get("/api/groups/:id", (req, res) => {
    res.status(501).json({ 
      message: "Group details endpoint not implemented" 
    });
  });

  // Update group (stub)
  app.put("/api/groups/:id", (req, res) => {
    res.status(501).json({ 
      message: "Update group endpoint not implemented" 
    });
  });

  // Delete group (stub)
  app.delete("/api/groups/:id", (req, res) => {
    res.status(501).json({ 
      message: "Delete group endpoint not implemented" 
    });
  });

  // Join group (stub)
  app.post("/api/groups/:id/join", (req, res) => {
    res.status(501).json({ 
      message: "Join group endpoint not implemented" 
    });
  });

  // Leave group (stub)
  app.post("/api/groups/:id/leave", (req, res) => {
    res.status(501).json({ 
      message: "Leave group endpoint not implemented" 
    });
  });

  // Get group members (stub)
  app.get("/api/groups/:id/members", (req, res) => {
    res.status(501).json({ 
      message: "Group members endpoint not implemented" 
    });
  });

  // ==================== TRANSACTIONS ENDPOINTS ====================
  
  // Get user transactions (stub)
  app.get("/api/transactions/my", (req, res) => {
    res.status(501).json({ 
      message: "Transactions endpoint not implemented" 
    });
  });

  // Get user contributions (stub)
  app.get("/api/contributions/my", (req, res) => {
    res.status(501).json({ 
      message: "Contributions endpoint not implemented" 
    });
  });

  // Create transaction (stub)
  app.post("/api/transactions", (req, res) => {
    res.status(501).json({ 
      message: "Create transaction endpoint not implemented" 
    });
  });

  // ==================== NOTIFICATIONS ENDPOINTS ====================
  
  // Get notifications (stub)
  app.get("/api/notifications", (req, res) => {
    res.status(501).json({ 
      message: "Notifications endpoint not implemented" 
    });
  });

  // Mark notification as read (stub)
  app.put("/api/notifications/:id/read", (req, res) => {
    res.status(501).json({ 
      message: "Mark notification read not implemented" 
    });
  });

  // ==================== PAYMENT ENDPOINTS ====================
  
  // Setup intent (stub)
  app.post("/api/payment/setup-intent", (req, res) => {
    res.status(501).json({ 
      message: "Payment setup endpoint not implemented" 
    });
  });

  // Get payment methods (stub)
  app.get("/api/payment/methods", (req, res) => {
    res.status(501).json({ 
      message: "Payment methods endpoint not implemented" 
    });
  });

  // Add payment method (stub)
  app.post("/api/payment/methods", (req, res) => {
    res.status(501).json({ 
      message: "Add payment method endpoint not implemented" 
    });
  });

  // Delete payment method (stub)
  app.delete("/api/payment/methods/:id", (req, res) => {
    res.status(501).json({ 
      message: "Delete payment method endpoint not implemented" 
    });
  });

  // ==================== WAITLIST ENDPOINT ====================
  
  // Join waitlist (stub)
  app.post("/api/waitlist/join", (req, res) => {
    res.status(501).json({ 
      message: "Waitlist endpoint not implemented - Add your database logic here" 
    });
  });

  // ==================== CATCH ALL ====================
  
  // Any other API route
  app.all("/api/*", (req, res) => {
    res.status(404).json({ 
      message: `API endpoint ${req.method} ${req.path} not found - Backend implementation needed` 
    });
  });

  return createServer(app);
}
