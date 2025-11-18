import Stripe from 'stripe';
import { storage } from '../storage';
import { groupService } from './groupService';

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("STRIPE_SECRET_KEY environment variable not set. Payment processing will be disabled.");
}

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-08-27.basil",
}) : null;

export class PaymentService {
  
  async createPaymentIntent(
    userId: string,
    contributionId: string,
    amount: number
  ): Promise<{ clientSecret: string; paymentIntentId: string }> {
    if (!stripe) {
      throw new Error('Stripe not configured');
    }

    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const contribution = await storage.getContribution(contributionId);
    if (!contribution) {
      throw new Error('Contribution not found');
    }

    const group = await storage.getGroup(contribution.groupId);
    if (!group) {
      throw new Error('Group not found');
    }

    // Create or get Stripe customer
    let customerId: string | undefined = user.stripeCustomerId || undefined;
    if (!customerId && user.email) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`.trim(),
      });
      customerId = customer.id;
      await storage.updateUserStripeCustomerId(userId, customerId);
    }

    if (!customerId) {
      throw new Error('Customer ID is required');
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to pence
      currency: 'gbp',
      customer: customerId,
      metadata: {
        contributionId,
        groupId: contribution.groupId,
        userId,
        round: contribution.round.toString(),
      },
      description: `Contribution for ${group.name} - Round ${contribution.round}`,
    });

    // Update contribution with payment intent ID
    await storage.updateContribution(contributionId, {
      stripePaymentIntentId: paymentIntent.id,
    });

    return {
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id,
    };
  }

  async handlePaymentSuccess(paymentIntentId: string): Promise<void> {
    if (!stripe) {
      console.warn('Stripe not configured, skipping payment success handling');
      return;
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (!paymentIntent.metadata) {
      throw new Error('Payment intent missing metadata');
    }

    const { contributionId, groupId, userId, round } = paymentIntent.metadata;

    // Update contribution status
    await storage.updateContribution(contributionId, {
      status: 'paid',
      paidDate: new Date(),
    });

    // Create transaction record
    await storage.createTransaction({
      groupId,
      fromUserId: userId,
      amount: (paymentIntent.amount / 100).toString(), // Convert from cents
      type: 'contribution',
      round: parseInt(round),
      description: `Contribution payment - Round ${round}`,
      stripeTransactionId: paymentIntentId,
    });

    // Create notification
    const group = await storage.getGroup(groupId);
    if (group) {
      await storage.createNotification({
        userId,
        groupId,
        type: 'payment_received',
        title: 'Payment Confirmed',
        message: `Your contribution of £${paymentIntent.amount / 100} for ${group.name} has been received.`,
      });
    }

    // Check if all contributions for this round are complete
    await this.checkRoundCompletion(groupId, parseInt(round));
  }

  async handlePaymentFailure(paymentIntentId: string): Promise<void> {
    if (!stripe) {
      console.warn('Stripe not configured, skipping payment failure handling');
      return;
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (!paymentIntent.metadata) {
      throw new Error('Payment intent missing metadata');
    }

    const { contributionId, groupId, userId } = paymentIntent.metadata;

    // Update contribution status
    await storage.updateContribution(contributionId, {
      status: 'failed',
    });

    // Create notification
    const group = await storage.getGroup(groupId);
    if (group) {
      await storage.createNotification({
        userId,
        groupId,
        type: 'payment_failed',
        title: 'Payment Failed',
        message: `Your payment for ${group.name} could not be processed. Please try again.`,
      });
    }
  }

  private async checkRoundCompletion(groupId: string, round: number): Promise<void> {
    const contributions = await storage.getGroupContributions(groupId, round);
    const allPaid = contributions.every(c => c.status === 'paid');
    
    if (allPaid && contributions.length > 0) {
      // All contributions for this round are complete, process payout
      await groupService.processGroupRotation(groupId);
    }
  }

  async processRefund(
    paymentIntentId: string,
    amount?: number,
    reason: 'duplicate' | 'fraudulent' | 'requested_by_customer' = 'requested_by_customer'
  ): Promise<void> {
    if (!stripe) {
      throw new Error('Stripe not configured');
    }

    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
      reason: reason,
    });

    // Update contribution and create transaction record
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.metadata) {
      const { contributionId, groupId, userId } = paymentIntent.metadata;
      
      await storage.createTransaction({
        groupId,
        toUserId: userId,
        amount: (refund.amount / 100).toString(),
        type: 'refund',
        description: `Refund for payment ${paymentIntentId}`,
        stripeTransactionId: refund.id,
      });
    }
  }
}

export const paymentService = new PaymentService();
