import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/lib/stripe';
import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';

const SubscribeForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin,
      },
    });

    setIsLoading(false);

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: "Welcome to TradeMindAI Pro!",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button 
        type="submit" 
        disabled={!stripe || isLoading}
        className="w-full bg-trading-blue hover:bg-trading-blue/90"
      >
        {isLoading ? 'Processing...' : 'Subscribe to Pro'}
      </Button>
    </form>
  );
};

export default function Subscribe() {
  const [clientSecret, setClientSecret] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest("POST", "/api/create-subscription")
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
      })
      .catch((err) => {
        setError(err.message);
      });
  }, []);

  if (error) {
    return (
      <div className="py-8">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-500">Subscription Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Link href="/">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="py-8">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="p-8">
              <div className="text-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-muted-foreground">Setting up your subscription...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Upgrade to Pro</h1>
          <p className="mt-2 text-muted-foreground">
            Unlock advanced AI trading strategies and unlimited features
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>TradeMindAI Pro Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="bg-muted/50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-foreground mb-2">What you get:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-trading-green rounded-full mr-3" />
                    Advanced AI trading strategies
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-trading-green rounded-full mr-3" />
                    Unlimited simulated trades
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-trading-green rounded-full mr-3" />
                    Real-time trading alerts
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-trading-green rounded-full mr-3" />
                    Advanced backtesting tools
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-trading-green rounded-full mr-3" />
                    Priority customer support
                  </li>
                </ul>
              </div>
              
              <div className="text-center mb-6">
                <p className="text-3xl font-bold text-foreground">
                  $29<span className="text-lg font-normal text-muted-foreground">/month</span>
                </p>
                <p className="text-sm text-muted-foreground">Cancel anytime</p>
              </div>
            </div>

            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <SubscribeForm />
            </Elements>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
