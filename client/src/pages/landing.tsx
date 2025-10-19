import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  DollarSign,
  Shield,
  Clock,
  ArrowRight,
  Banknote,
  UserCheck,
  BarChart3,
  Zap,
} from "lucide-react";
import { HorebSaveLogo } from "@/components/HorebSaveLogo";
import { HeroSavingsImage } from "@/components/HeroSavingsImage";
import { useEffect, useState } from "react";

function HowItWorksCarousel() {
  const [api, setApi] = useState<any>();

  useEffect(() => {
    if (!api) return;

    const interval = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext();
      } else {
        api.scrollTo(0);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [api]);

  return (
    <Carousel
      className="w-full max-w-md lg:max-w-lg"
      setApi={setApi}
      opts={{
        align: "start",
        loop: true,
      }}
    >
      <CarouselContent>
        <CarouselItem>
          <div className="p-1">
            <img
              src="/images/HowItWorks_Img.png"
              alt="How Horeb Save Works"
              className="w-full h-auto object-contain rounded-lg shadow-lg"
            />
          </div>
        </CarouselItem>
        <CarouselItem>
          <div className="p-1">
            <img
              src="/images/moneyJar.png"
              alt="Money Jar - Save Together"
              className="w-full h-auto object-contain rounded-lg shadow-lg"
            />
          </div>
        </CarouselItem>
        <CarouselItem>
          <div className="p-1">
            <img
              src="/images/trustedSecure.png"
              alt="Trusted and Secure Platform"
              className="w-full h-auto object-contain rounded-lg shadow-lg"
            />
          </div>
        </CarouselItem>
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}

export default function Landing() {
  return (
    <div>
      {/* Hero Section with Header */}
      <section
        id="home"
        className="py-16 sm:py-20 lg:py-32 min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 relative"
      >
        {/* Header */}
        <header className="absolute top-3 sm:top-5 left-0 right-0 z-50">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
            <div className="flex justify-between items-center h-14 sm:h-16">
              {/* Logo */}
              <div className="flex items-center space-x-2">
                <HorebSaveLogo className="w-8 h-8 sm:w-10 sm:h-10" />
                <h1 className="text-lg sm:text-xl font-bold text-foreground">
                  Horeb Save
                </h1>
              </div>

              {/* Navigation Links - Hidden on mobile */}
              <div className="hidden lg:flex items-center space-x-6 xl:space-x-8 px-4 xl:px-6 py-3 rounded-full backdrop-blur-md bg-white/10 border border-white/20">
                <a
                  href="#home"
                  className="text-foreground hover:text-primary transition-colors font-medium text-sm xl:text-base"
                >
                  Home
                </a>
                <a
                  href="#how-it-works"
                  className="text-foreground hover:text-primary transition-colors font-medium text-sm xl:text-base"
                >
                  How It Works
                </a>
                <a
                  href="#why-choose-us"
                  className="text-foreground hover:text-primary transition-colors font-medium text-sm xl:text-base"
                >
                  Why Choose Us
                </a>
              </div>

              {/* Get Started Button */}
              <Button
                asChild
                data-testid="button-login"
                className="bg-primary text-white hover:bg-primary/90 transition-colors text-sm sm:text-base px-3 sm:px-4 py-2"
                size="sm"
              >
                <a
                  href="/api/login"
                  className="flex items-center space-x-1 sm:space-x-2"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </a>
              </Button>
            </div>
          </div>
        </header>

        {/* Hero Content - Split Layout */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 pt-16 sm:pt-20 h-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center min-h-[70vh]">
            {/* Left Side - Text Content */}
            <div className="space-y-6 sm:space-y-8 text-center lg:text-left order-2 lg:order-1">
              <div className="space-y-3 sm:space-y-4">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight">
                  Save Money with
                </h1>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-primary leading-tight">
                  Friends & Family
                </h1>
                <p className="text-lg sm:text-xl text-gray-600 max-w-lg mx-auto lg:mx-0">
                  Join thousands of people building wealth together through
                  trusted rotating savings groups and peer-to-peer banking.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <Button
                  size="lg"
                  asChild
                  className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 bg-primary text-white hover:bg-primary/90 w-full sm:w-auto"
                  data-testid="button-start-saving"
                >
                  <a href="/api/login">Start Saving Today</a>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  asChild
                  className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 border-primary text-primary hover:bg-primary hover:text-white w-full sm:w-auto"
                  data-testid="button-learn-more"
                >
                  <a href="#how-it-works">Learn How It Works</a>
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-3 sm:space-y-0 sm:space-x-4 lg:space-x-6 pt-4">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-600">
                    Bank-level Security
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-600">
                    10,000+ Members
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-600">
                    £2M+ Saved
                  </span>
                </div>
              </div>
            </div>

            {/* Right Side - Hero Image */}
            <div className="flex justify-center lg:justify-end order-1 lg:order-2">
              <HeroSavingsImage className="w-full max-w-xs sm:max-w-md lg:max-w-lg h-auto" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="why-choose-us" className="py-16 sm:py-20 relative">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          {/* Dark background box for text content */}
          <div className="relative">
            <div className="bg-gray-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 relative z-10">
              {/* Header */}
              <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">
                  Why Choose Horeb Save?
                </h2>
                <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-2xl mx-auto px-2 sm:px-0">
                  Experience the power of community savings with modern security
                  and convenience.
                </p>
              </div>
            </div>

            {/* Square cards that overlap into the dark box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 px-2 sm:px-4 relative z-20 -mt-12 sm:-mt-16 max-w-3xl sm:max-w-4xl lg:max-w-5xl mx-auto">
              {/* Card 1 - Secure & Trusted */}
              <Card className="w-full h-64 sm:h-72 lg:h-80 mx-auto relative overflow-hidden border-2 border-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-0 h-full relative">
                  {/* Background image */}
                  <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-80"
                    style={{
                      backgroundImage: "url('/images/trustedSecure.png')",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  {/* Overlay gradient for text readability */}
                  <div className="absolute inset-0 " />

                  {/* Text overlay */}
                  <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 z-10">
                    <h4 className="text-base sm:text-lg lg:text-xl font-bold mb-1 sm:mb-2">
                      Secure & Trusted
                    </h4>
                    <p className="text-xs sm:text-sm opacity-90">
                      Built-in trust scoring and secure escrow
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Card 2 - Automated Payouts */}
              <Card className="w-full h-64 sm:h-72 lg:h-80 mx-auto relative overflow-hidden border-2 border-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-0 h-full relative">
                  {/* Background image */}
                  <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-80"
                    style={{
                      backgroundImage: "url('/images/automatedpayouts.png')",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  {/* Overlay gradient for text readability */}
                  <div className="absolute inset-0 " />

                  {/* Text overlay */}
                  <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4  z-10">
                    <h4 className="text-base sm:text-lg lg:text-xl font-bold mb-1 sm:mb-2">
                      Automated Payouts
                    </h4>
                    <p className="text-xs sm:text-sm opacity-90">
                      Smart scheduling for fair rotation
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Card 3 - Flexible Groups */}
              <Card className="w-full h-64 sm:h-72 lg:h-80 mx-auto relative overflow-hidden border-2 border-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-0 h-full relative">
                  {/* Background image */}
                  <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-80"
                    style={{
                      backgroundImage: "url('/images/flexibleGroups.png')",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  {/* Overlay gradient for text readability */}
                  <div className="absolute inset-0 " />

                  {/* Text overlay */}
                  <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4  z-10">
                    <h4 className="text-base sm:text-lg lg:text-xl font-bold mb-1 sm:mb-2">
                      Flexible Groups
                    </h4>
                    <p className="text-xs sm:text-sm opacity-90">
                      Custom groups with your preferences
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Card 4 - Transparent */}
              <Card className="w-full h-64 sm:h-72 lg:h-80 mx-auto relative overflow-hidden border-2 border-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-0 h-full relative">
                  {/* Background image */}
                  <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-80"
                    style={{
                      backgroundImage: "url('/images/transparent.png')",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  {/* Overlay gradient for text readability */}
                  <div className="absolute inset-0 " />

                  {/* Text overlay */}
                  <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4  z-10">
                    <h4 className="text-base sm:text-lg lg:text-xl font-bold mb-1 sm:mb-2">
                      Transparent
                    </h4>
                    <p className="text-xs sm:text-sm opacity-90">
                      Complete visibility into all transactions
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            {/* Left side - Header and Steps */}
            <div className="space-y-6 sm:space-y-8 order-2 lg:order-1">
              {/* Header */}
              <div className="text-center lg:text-left">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">
                  How It Works
                </h2>
                <p className="text-lg sm:text-xl text-muted-foreground">
                  Join or create a savings group and start building your
                  financial goals together.
                </p>
              </div>

              {/* Steps */}
              <div className="space-y-6 sm:space-y-8">
                <div
                  className="flex items-start space-x-3 sm:space-x-4"
                  data-testid="step-create"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-lg sm:text-xl font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold mb-2">
                      Create or Join
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      Start a new savings group or join an existing one that
                      matches your goals and timeline.
                    </p>
                  </div>
                </div>

                <div
                  className="flex items-start space-x-3 sm:space-x-4"
                  data-testid="step-contribute"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-full flex items-center justify-center text-white text-lg sm:text-xl font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold mb-2">
                      Contribute Regularly
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      Make your scheduled contributions with automated reminders
                      and secure payment processing.
                    </p>
                  </div>
                </div>

                <div
                  className="flex items-start space-x-3 sm:space-x-4"
                  data-testid="step-receive"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-full flex items-center justify-center text-white text-lg sm:text-xl font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold mb-2">
                      Receive Your Turn
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      When it's your turn, receive the full pooled amount from
                      all group members' contributions.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Image Carousel */}
            <div className="flex justify-center lg:justify-end order-1 lg:order-2">
              <HowItWorksCarousel />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 px-3 sm:px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div
            className="relative bg-cover bg-center bg-no-repeat min-h-[400px] sm:min-h-[500px] flex items-center rounded-2xl sm:rounded-3xl border-2 border-gray-200 shadow-xl overflow-hidden"
            style={{ backgroundImage: "url('/images/GetStarted_Img.png')" }}
          >
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-black/30 rounded-2xl sm:rounded-3xl"></div>

            <div className="w-full relative z-10 px-6 sm:px-8 lg:px-16">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center text-center lg:text-left">
                {/* Left side - Text */}
                <div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6">
                    Ready to Start Your Savings Journey?
                  </h2>
                  <p className="text-lg sm:text-xl text-white/90 mb-6 sm:mb-8">
                    Join thousands of people already saving together through
                    Horeb Save's trusted platform.
                  </p>
                </div>

                {/* Right side - Button */}
                <div className="flex justify-center lg:justify-end">
                  <Button
                    size="lg"
                    asChild
                    className="bg-white text-black hover:bg-gray-100 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 flex items-center space-x-2 shadow-lg w-full sm:w-auto max-w-xs"
                    data-testid="button-join-now"
                  >
                    <a
                      href="/api/login"
                      className="flex items-center space-x-2"
                    >
                      <span>Join Now - It's Free</span>
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Spacer between CTA and Footer */}
      <div className="py-6 sm:py-8 bg-gray-50 border-t border-gray-200"></div>

      {/* Footer */}
      <footer className="py-12 sm:py-16" style={{ backgroundColor: "#1D2939" }}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {/* Logo and Brand */}
            <div className="space-y-4 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <HorebSaveLogo className="w-8 h-8 sm:w-10 sm:h-10" />
                <span className="text-lg sm:text-xl font-bold text-white">
                  Horeb Save
                </span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Building financial communities together through trusted rotating
                savings groups.
              </p>
            </div>

            {/* Products */}
            <div className="space-y-4 text-center sm:text-left">
              <h3 className="text-white font-semibold text-base sm:text-lg">
                Products
              </h3>
              <ul className="space-y-2 sm:space-y-3">
                <li>
                  <a
                    href="#why-choose-us"
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    Why Choose Us
                  </a>
                </li>
                <li>
                  <a
                    href="#how-it-works"
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    How It Works
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div className="space-y-4 text-center sm:text-left">
              <h3 className="text-white font-semibold text-base sm:text-lg">
                Legal
              </h3>
              <ul className="space-y-2 sm:space-y-3">
                <li>
                  <a
                    href="/privacy-policy"
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="/terms-of-service"
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-4 text-center sm:text-left">
              <h3 className="text-white font-semibold text-base sm:text-lg">
                Support
              </h3>
              <ul className="space-y-2 sm:space-y-3">
                <li>
                  <a
                    href="https://tally.so/r/mZpLoy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                    data-testid="link-product-support"
                  >
                    Product Support
                  </a>
                </li>
              </ul>
            </div>

            {/* Social Links */}
            <div className="space-y-4 text-center sm:text-left">
              <h3 className="text-white font-semibold text-base sm:text-lg">
                Follow Us
              </h3>
              <div className="flex justify-center sm:justify-start space-x-4">
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors"
                  aria-label="LinkedIn"
                >
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors"
                  aria-label="X (Twitter)"
                >
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
                  </svg>
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors"
                  aria-label="Instagram"
                >
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.618 5.367 11.987 11.987 11.987s11.987-5.369 11.987-11.987C24.014 5.367 18.635.001 12.017.001zm5.568 16.791c-.001.232-.016.467-.047.695-.134 1.005-.648 1.519-1.653 1.653-.5.067-1.005.093-1.533.093H9.388c-.528 0-1.033-.026-1.533-.093-1.005-.134-1.519-.648-1.653-1.653-.067-.5-.093-1.004-.093-1.532V7.987c0-.528.026-1.033.093-1.533.134-1.005.648-1.519 1.653-1.653.5-.067 1.005-.093 1.533-.093h5.964c.528 0 1.033.026 1.533.093 1.005.134 1.519.648 1.653 1.653.031.228.046.463.047.695v8.804zm-2.568-4.791c0-2.172-1.804-3.976-3.976-3.976s-3.976 1.804-3.976 3.976 1.804 3.976 3.976 3.976 3.976-1.804 3.976-3.976zm-1.5 0c0 1.379-1.097 2.476-2.476 2.476s-2.476-1.097-2.476-2.476 1.097-2.476 2.476-2.476 2.476 1.097 2.476 2.476zm4.017-4.204c0 .554-.436.99-.99.99s-.99-.436-.99-.99.436-.99.99-.99.99.436.99.99z" />
                  </svg>
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors"
                  aria-label="Facebook"
                >
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom bar with copyright */}
          <div className="border-t border-gray-600 mt-8 sm:mt-12 pt-6 sm:pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center text-center sm:text-left">
              <p className="text-gray-400 text-sm mb-4 sm:mb-0">
                © 2024 Horeb Save. All rights reserved. Building financial
                communities together.
              </p>
              <div className="flex space-x-4 sm:space-x-6">
                <a
                  href="/privacy-policy"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Privacy
                </a>
                <a
                  href="/terms-of-service"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Terms
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
