import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  DollarSign,
  Shield,
  Clock,
  ArrowRight,
  Banknote,
  UserCheck,
  BarChart3,
  Zap,
} from "lucide-react";

export default function Landing() {
  return (
    <div>
      {/* Hero Section with Header */}
      <section
        id="home"
        className="py-20 lg:py-32 min-h-screen bg-cover bg-center bg-no-repeat relative"
        style={{ backgroundImage: "url('/images/landing_Img.png')" }}
      >
        {/* Header */}
        <header className="absolute top-5 left-0 right-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <Users className="text-primary-foreground text-lg" />
                </div>
                <h1 className="text-xl font-bold text-foreground">
                  CircleSave
                </h1>
              </div>

              {/* Navigation Links */}
              <div className="hidden md:flex items-center space-x-8 px-6 py-3 rounded-full backdrop-blur-md bg-white/10 border border-white/20">
                <a
                  href="#home"
                  className="text-foreground hover:text-primary transition-colors font-medium"
                >
                  Home
                </a>
                <a
                  href="#how-it-works"
                  className="text-foreground hover:text-primary transition-colors font-medium"
                >
                  How It Works
                </a>
                <a
                  href="#why-choose-us"
                  className="text-foreground hover:text-primary transition-colors font-medium"
                >
                  Why Choose Us
                </a>
              </div>

              {/* Get Started Button */}
              <Button
                asChild
                data-testid="button-login"
                className="bg-white text-black hover:bg-primary hover:text-white transition-colors"
              >
                <a href="/api/login" className="flex items-center space-x-2">
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </Button>
            </div>
          </div>
        </header>

        {/* Hero Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 h-full relative">
          <div className="flex h-full min-h-[60vh] relative">
            {/* Bottom Left - Heading and Buttons */}
            <div className="absolute bottom-0 left-0 mx-20 ">
              <h1 className="text-2xl lg:text-6xl font-bold text-white mb-6">
                Save Money with
              </h1>
              <h1 className="text-2xl lg:text-6xl font-bold text-white mb-6">
                Friends & Family
              </h1>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  asChild
                  className="text-lg px-8 py-3 bg-white text-black hover:bg-gray-100 border-2 border-white"
                  data-testid="button-start-saving"
                >
                  <a href="/api/login">Start Saving Today</a>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-3 text-white border-2 border-white/30 bg-white/10 backdrop-blur-sm hover:bg-white/20"
                  data-testid="button-learn-more"
                >
                  Learn How It Works
                </Button>
              </div>
            </div>

            {/* Middle Right - Paragraph */}
            <div className="absolute right-0 top-1/3 transform -translate-y-1/2 max-w-md">
              <p className="text-xl text-white leading-relaxed text-right">
                Join rotating savings groups where everyone contributes
                regularly and takes turns receiving the full amount. Build
                financial goals together with trust and accountability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="why-choose-us"
        className="py-20 bg-card/50 min-h-screen flex items-center"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Why Choose CircleSave?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the power of community savings with modern security and
              convenience.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-6xl mx-auto">
            <Card
              className="border-border/50 hover:shadow-2xl transition-all duration-300 hover:scale-105 relative overflow-hidden h-64"
              data-testid="card-feature-trust"
            >
              <CardContent className="p-8 h-full relative">
                {/* Image at top right - bigger and scaling off */}
                <div className="absolute -top-8 -right-8 w-56 h-56 z-10">
                  <img
                    src="/images/trustedSecure.png"
                    alt="Secure & Trusted"
                    className="w-full h-full object-cover rounded-xl transform rotate-1 hover:rotate-6 transition-transform duration-300"
                  />
                </div>

                {/* Text at bottom left */}
                <div className="absolute bottom-4 left-4 max-w-[60%]">
                  <h3 className="text-2xl font-bold mb-2">Secure & Trusted</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Built-in trust scoring and secure escrow services protect
                    your contributions.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card
              className="border-border/50 hover:shadow-2xl transition-all duration-300 hover:scale-105 relative overflow-hidden h-64"
              data-testid="card-feature-automated"
            >
              <CardContent className="p-8 h-full relative">
                <div className="absolute -top-8 -right-8 w-56 h-56 z-10">
                  <img
                    src="/images/automatedpayouts.png"
                    alt="Automated Payouts"
                    className="w-full h-full object-cover rounded-xl transform rotate-1 hover:rotate-6 transition-transform duration-300"
                  />
                </div>

                {/* Text at bottom left */}
                <div className="absolute bottom-4 left-4 max-w-[60%]">
                  <h3 className="text-2xl font-bold mb-2">Automated Payouts</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Smart scheduling ensures fair rotation and timely payouts to
                    members.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card
              className="border-border/50 hover:shadow-2xl transition-all duration-300 hover:scale-105 relative overflow-hidden h-64"
              data-testid="card-feature-flexible"
            >
              <CardContent className="p-8 h-full relative">
                {/* Image at top right - bigger and scaling off */}
                <div className="absolute -top-8 -right-8 w-56 h-56 z-10">
                  <img
                    src="/images/flexibleGroups.png"
                    alt="Flexible Groups"
                    className="w-full h-full object-cover rounded-xl transform rotate-1 hover:rotate-6 transition-transform duration-300"
                  />
                </div>

                {/* Text at bottom left */}
                <div className="absolute bottom-4 left-4 max-w-[60%]">
                  <h3 className="text-2xl font-bold mb-2">Flexible Groups</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Create custom groups with your preferred amount, frequency,
                    and members.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card
              className="border-border/50 hover:shadow-2xl transition-all duration-300 hover:scale-105 relative overflow-visible h-64"
              data-testid="card-feature-transparent"
            >
              <CardContent className="p-8 h-full relative">
                {/* Image at top right - bigger and scaling off */}
                <div className="absolute -top-8 -right-8 w-56 h-56 z-10">
                  <img
                    src="/images/transparent.png"
                    alt="Transparent"
                    className="w-full h-full object-cover rounded-xl transform rotate-1 hover:rotate-6 transition-transform duration-300"
                  />
                </div>

                {/* Text at bottom left */}
                <div className="absolute bottom-4 left-4 max-w-[60%]">
                  <h3 className="text-2xl font-bold mb-2">Transparent</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Complete visibility into all transactions and group
                    activities.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Header and Steps */}
            <div className="space-y-8">
              {/* Header */}
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                  How It Works
                </h2>
                <p className="text-xl text-muted-foreground">
                  Join or create a savings group and start building your
                  financial goals together.
                </p>
              </div>

              {/* Steps */}
              <div className="space-y-8">
                <div
                  className="flex items-start space-x-4"
                  data-testid="step-create"
                >
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xl font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      Create or Join
                    </h3>
                    <p className="text-muted-foreground">
                      Start a new savings group or join an existing one that
                      matches your goals and timeline.
                    </p>
                  </div>
                </div>

                <div
                  className="flex items-start space-x-4"
                  data-testid="step-contribute"
                >
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-secondary-foreground text-xl font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      Contribute Regularly
                    </h3>
                    <p className="text-muted-foreground">
                      Make your scheduled contributions with automated reminders
                      and secure payment processing.
                    </p>
                  </div>
                </div>

                <div
                  className="flex items-start space-x-4"
                  data-testid="step-receive"
                >
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      Receive Your Turn
                    </h3>
                    <p className="text-muted-foreground">
                      When it's your turn, receive the full pooled amount from
                      all group members' contributions.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Image */}
            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-md lg:max-w-lg">
                <img
                  src="/images/HowItWorks_Img.png"
                  alt="How CircleSave Works"
                  className="w-full h-auto object-contain rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="py-20 relative bg-cover bg-center bg-no-repeat min-h-[500px] flex items-center"
        style={{ backgroundImage: "url('/images/GetStarted_Img.png')" }}
      >
        {/* Optional overlay for better text readability */}
        <div className="absolute inset-0 bg-black/30"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left side - Text */}
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                Ready to Start Your Savings Journey?
              </h2>
              <p className="text-xl text-white/90 mb-8">
                Join thousands of people already saving together through
                CircleSave's trusted platform.
              </p>
            </div>

            {/* Right side - Button */}
            <div className="flex justify-center lg:justify-end">
              <Button
                size="lg"
                asChild
                className="bg-white text-black hover:bg-gray-100 text-lg px-8 py-3 flex items-center space-x-2"
                data-testid="button-join-now"
              >
                <a href="/api/login" className="flex items-center space-x-2">
                  <span>Join Now - It's Free</span>
                  <ArrowRight className="w-5 h-5" />
                </a>
              </Button>
            </div>
          </div>
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
              <span className="text-lg font-bold text-foreground">
                CircleSave
              </span>
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
