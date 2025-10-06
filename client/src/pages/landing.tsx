import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, DollarSign, Shield, Clock } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Users className="text-primary-foreground text-lg" />
              </div>
              <h1 className="text-xl font-bold text-foreground">CircleSave</h1>
            </div>
            
            <Button asChild data-testid="button-login">
              <a href="/api/login">Get Started</a>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
              Save Money with
              <span className="text-primary"> Friends & Family</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Join rotating savings groups where everyone contributes regularly and takes turns receiving the full amount. 
              Build financial goals together with trust and accountability.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="text-lg px-8 py-3" data-testid="button-start-saving">
                <a href="/api/login">Start Saving Today</a>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-3" data-testid="button-learn-more">
                Learn How It Works
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Why Choose CircleSave?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the power of community savings with modern security and convenience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-border/50 hover:shadow-lg transition-shadow" data-testid="card-feature-trust">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="text-secondary text-xl" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Secure & Trusted</h3>
                <p className="text-muted-foreground text-sm">
                  Built-in trust scoring and secure escrow services protect your contributions.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:shadow-lg transition-shadow" data-testid="card-feature-automated">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Clock className="text-primary text-xl" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Automated Payouts</h3>
                <p className="text-muted-foreground text-sm">
                  Smart scheduling ensures fair rotation and timely payouts to members.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:shadow-lg transition-shadow" data-testid="card-feature-flexible">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="text-accent text-xl" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Flexible Groups</h3>
                <p className="text-muted-foreground text-sm">
                  Create custom groups with your preferred amount, frequency, and members.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:shadow-lg transition-shadow" data-testid="card-feature-transparent">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="text-secondary text-xl" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Transparent</h3>
                <p className="text-muted-foreground text-sm">
                  Complete visibility into all transactions and group activities.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join or create a savings group and start building your financial goals together.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center" data-testid="step-create">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-primary-foreground text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-3">Create or Join</h3>
              <p className="text-muted-foreground">
                Start a new savings group or join an existing one that matches your goals and timeline.
              </p>
            </div>

            <div className="text-center" data-testid="step-contribute">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 text-secondary-foreground text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-3">Contribute Regularly</h3>
              <p className="text-muted-foreground">
                Make your scheduled contributions with automated reminders and secure payment processing.
              </p>
            </div>

            <div className="text-center" data-testid="step-receive">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4 text-accent-foreground text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-3">Receive Your Turn</h3>
              <p className="text-muted-foreground">
                When it's your turn, receive the full pooled amount from all group members' contributions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
            Ready to Start Your Savings Journey?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of people already saving together through CircleSave's trusted platform.
          </p>
          <Button size="lg" asChild className="text-lg px-8 py-3" data-testid="button-join-now">
            <a href="/api/login">Join Now - It's Free</a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Users className="text-primary-foreground text-sm" />
              </div>
              <span className="text-lg font-bold text-foreground">CircleSave</span>
            </div>
            <p className="text-muted-foreground text-sm">
              © 2024 CircleSave. Building financial communities together.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
