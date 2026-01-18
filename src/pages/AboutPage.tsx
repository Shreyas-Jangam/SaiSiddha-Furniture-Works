import { Link } from 'react-router-dom';
import { ArrowLeft, Users, Award, MapPin, Phone, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BUSINESS_INFO } from '@/types';
import logo from '@/assets/logo.jpeg';

export default function AboutPage() {
  const stats = [
    { label: 'Years Experience', value: '10+', icon: Award },
    { label: 'Happy Clients', value: '500+', icon: Users },
    { label: 'Products Delivered', value: '50K+', icon: Sparkles },
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
        <div className="absolute top-10 left-10 w-64 h-64 bg-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center text-white">
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-sm font-medium mb-6 animate-fade-in">
              Our Story
            </span>
            <h1 className="font-display text-5xl md:text-6xl font-bold mb-6 animate-slide-up">
              About <span className="text-gradient-accent">Us</span>
            </h1>
            <p className="text-lg text-white/80 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Crafting quality wooden solutions since day one
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 -mt-10 relative z-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="grid grid-cols-3 gap-4">
              {stats.map((stat, index) => (
                <div 
                  key={stat.label}
                  className="glass-card p-6 text-center animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="font-display text-2xl md:text-3xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs md:text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Main Content */}
          <div className="feature-card space-y-6 animate-fade-in-up">
            <p className="text-lg text-foreground leading-relaxed">
              <span className="font-semibold text-primary">{BUSINESS_INFO.name}</span> specialises in the production of all kinds of wooden materials used in industries.
              By maintaining consistent, long-term business relationships with our clients, we have established a stellar reputation in the market.
            </p>
            
            <p className="text-muted-foreground leading-relaxed">
              Our spacious workspace and highly skilled labour are our greatest strengths.
              We have our own team of skilled labourers and a designated area for collecting various wooden materials from trusted sources.
            </p>
          </div>

          {/* Specializations */}
          <div className="feature-card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Award className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground">Our Specializations</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                'EURO 2-Way Pallets',
                'EURO 4-Way Pallets',
                'CP1 to CP9 Pallets',
                'Customised Solutions'
              ].map((item, index) => (
                <div 
                  key={item}
                  className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 hover:bg-primary/5 transition-colors group"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-primary to-accent group-hover:scale-125 transition-transform"></div>
                  <span className="text-foreground font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Owner Info */}
          <div className="feature-card animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                <Users className="w-10 h-10 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Owners</p>
                <p className="font-display text-xl font-bold text-foreground">{BUSINESS_INFO.owner}</p>
                <p className="font-display text-xl font-bold text-foreground">Mr. Prasad Nandgaonkar</p>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-border flex items-center gap-3">
              <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
              <p className="text-muted-foreground">{BUSINESS_INFO.location}</p>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <Phone className="w-5 h-5 text-primary flex-shrink-0" />
              <p className="text-muted-foreground">{BUSINESS_INFO.phone1} / {BUSINESS_INFO.phone2}</p>
            </div>
          </div>

          {/* Quote */}
          <div className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br from-primary to-secondary text-white animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="absolute top-0 right-0 w-40 h-40 bg-accent/20 rounded-full blur-3xl"></div>
            <blockquote className="relative z-10 text-xl md:text-2xl font-display italic text-center">
              "We believe that while price is forgotten, quality is remembered for a long time."
            </blockquote>
          </div>
        </div>
      </main>
    </div>
  );
}
