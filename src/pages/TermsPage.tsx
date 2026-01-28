import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, FileText, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BUSINESS_INFO } from '@/types';
import logo from '@/assets/logo.jpeg';

export default function TermsPage() {
  const terms = [
    { text: 'Online & offline communication allowed', category: 'Communication' },
    { text: 'Purchase Order (PO) considered based on email receipt date', category: 'Orders' },
    { text: 'Delivery schedule based on quantity & PO date', category: 'Delivery' },
    { text: 'Mail must include size, dimensions & required documents', category: 'Orders' },
    { text: 'Payment processing time: 20–30 days', category: 'Payment' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <img src={logo} alt="Logo" className="w-10 h-10 rounded-xl object-cover shadow-md ring-2 ring-primary/20" />
            <div>
              <h1 className="font-display text-lg font-bold text-foreground">{BUSINESS_INFO.name}</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-gradient relative py-20 overflow-hidden">
        <div className="hero-overlay absolute inset-0"></div>
        <div className="absolute top-10 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-accent/10 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center text-white">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-sm font-medium mb-6 animate-fade-in">
              <Scale className="w-4 h-4" />
              <span>Business Policies</span>
            </div>
            <h1 className="font-display text-5xl md:text-6xl font-bold mb-6 animate-slide-up">
              Terms & <span className="text-gradient-accent">Conditions</span>
            </h1>
            <p className="text-lg text-white/80 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Please read our business terms carefully
            </p>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          {/* Terms List */}
          <div className="feature-card mb-8 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-display text-xl font-bold text-foreground">Business Terms</h2>
            </div>
            
            <ul className="space-y-4">
              {terms.map((term, index) => (
                <li 
                  key={index} 
                  className="flex items-start gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-success" />
                  </div>
                  <div className="flex-1">
                    <span className="text-foreground">{term.text}</span>
                    <span className="ml-2 inline-block px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      {term.category}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Quote Card */}
          <div className="relative overflow-hidden rounded-2xl p-10 bg-gradient-to-br from-primary via-secondary to-wood-dark text-white animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="absolute top-0 right-0 w-48 h-48 bg-accent/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-primary/30 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <span className="text-4xl">"</span>
              </div>
              <blockquote className="text-2xl md:text-3xl font-display italic mb-6 leading-relaxed">
                We believe that while price is forgotten, quality is remembered for a long time.
              </blockquote>
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-0.5 bg-accent"></div>
                <p className="text-white/80 font-medium">{BUSINESS_INFO.name}</p>
                <div className="w-12 h-0.5 bg-accent"></div>
              </div>
            </div>
          </div>

          {/* Contact CTA */}
          <div className="mt-12 text-center animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <p className="text-muted-foreground mb-4">Have questions about our terms?</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a href={`tel:${BUSINESS_INFO.phone1}`}>
                <Button className="btn-primary rounded-xl px-8">
                  Call Us
                </Button>
              </a>
              <a href={`mailto:${BUSINESS_INFO.email}`}>
                <Button variant="outline" className="rounded-xl px-8 border-2">
                  Email Us
                </Button>
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
