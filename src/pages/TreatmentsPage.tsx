import { Link } from 'react-router-dom';
import { ArrowLeft, Flame, Thermometer, Wind, Shield, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BUSINESS_INFO } from '@/types';
import logo from '@/assets/logo.jpeg';

export default function TreatmentsPage() {
  const treatments = [
    {
      title: 'ISPM-15 Heat Treatment',
      description: 'International Standards for Phytosanitary Measures No. 15. Heat treatment to eliminate pests in wood packaging materials for international trade.',
      icon: Flame,
      color: 'from-orange-500/20 to-red-500/10',
      iconColor: 'text-orange-500',
      features: ['International trade compliant', 'Pest elimination', 'IPPC certified stamp'],
    },
    {
      title: 'NSPM-9 Heat Treatment',
      description: 'National Standards for Phytosanitary Measures. Ensures wood packaging complies with national regulations for pest-free materials.',
      icon: Thermometer,
      color: 'from-red-500/20 to-pink-500/10',
      iconColor: 'text-red-500',
      features: ['National compliance', 'Quality assurance', 'Documentation provided'],
    },
    {
      title: 'Forced Hot Air Treatment',
      description: 'Advanced heat treatment using forced hot air circulation for uniform temperature distribution throughout the wood.',
      icon: Wind,
      color: 'from-blue-500/20 to-cyan-500/10',
      iconColor: 'text-blue-500',
      features: ['Uniform heating', 'Deep penetration', 'Fast processing'],
    },
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
        <div className="absolute top-10 right-10 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center text-white">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-sm font-medium mb-6 animate-fade-in">
              <Shield className="w-4 h-4" />
              <span>Certified Treatments</span>
            </div>
            <h1 className="font-display text-5xl md:text-6xl font-bold mb-6 animate-slide-up">
              Pallet <span className="text-gradient-accent">Treatments</span>
            </h1>
            <p className="text-lg text-white/80 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Certified treatment procedures to ensure your wooden pallets meet international standards
            </p>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Treatment Cards */}
          <div className="space-y-8">
            {treatments.map((treatment, index) => (
              <div 
                key={index} 
                className="feature-card overflow-hidden animate-fade-in-up"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Icon */}
                  <div className={`w-20 h-20 flex-shrink-0 rounded-2xl bg-gradient-to-br ${treatment.color} flex items-center justify-center mx-auto md:mx-0`}>
                    <treatment.icon className={`w-10 h-10 ${treatment.iconColor}`} />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="font-display text-2xl font-bold text-foreground mb-3">{treatment.title}</h3>
                    <p className="text-muted-foreground mb-4">{treatment.description}</p>
                    
                    {/* Features */}
                    <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                      {treatment.features.map((feature, fIndex) => (
                        <div 
                          key={fIndex}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 text-sm"
                        >
                          <CheckCircle className="w-3.5 h-3.5 text-success" />
                          <span className="text-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Transport Note */}
          <div className="mt-12 relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br from-success/10 to-success/5 border border-success/20 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="w-14 h-14 rounded-2xl bg-success/20 flex items-center justify-center flex-shrink-0">
                <Shield className="w-7 h-7 text-success" />
              </div>
              <div>
                <h4 className="font-display text-lg font-bold text-foreground mb-1">Transport Facility Available</h4>
                <p className="text-muted-foreground">
                  We provide complete logistics support for treated pallets. Transport facilities can be arranged as per your requirements.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <p className="text-muted-foreground mb-4">Need treated pallets for your business?</p>
            <a href={`tel:${BUSINESS_INFO.phone1}`}>
              <Button className="btn-primary rounded-xl px-8 h-12">
                Contact Us Today
              </Button>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
