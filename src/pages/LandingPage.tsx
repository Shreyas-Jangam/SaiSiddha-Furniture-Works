import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, ArrowRight, Package, Calculator, FileCheck, Star, Shield, Truck, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BUSINESS_INFO } from '@/types';
import logo from '@/assets/logo.jpeg';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src={logo} alt="Logo" className="w-12 h-12 rounded-xl object-cover shadow-lg ring-2 ring-primary/20" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-background"></div>
            </div>
            <div>
              <h1 className="font-display text-lg font-bold text-foreground">{BUSINESS_INFO.name}</h1>
              <p className="text-xs text-muted-foreground">MIDC, Ratnagiri</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/about" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors relative group">
              About
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link to="/treatments" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors relative group">
              Treatments
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link to="/terms" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors relative group">
              Terms
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link to="/admin">
              <Button className="btn-primary rounded-xl px-6">Admin Panel</Button>
            </Link>
          </nav>
          <Link to="/admin" className="md:hidden">
            <Button className="btn-primary rounded-xl" size="sm">Admin</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-gradient relative overflow-hidden min-h-[90vh] flex items-center">
        <div className="hero-overlay absolute inset-0" />
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8 animate-fade-in">
              <Star className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium">Trusted by 500+ Industries</span>
            </div>
            
            <h2 className="font-display text-5xl md:text-7xl font-bold mb-6 animate-slide-up leading-tight">
              Industrial Wooden
              <span className="block text-gradient-accent">Pallets & Packaging</span>
            </h2>
            
            <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              {BUSINESS_INFO.tagline}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <Link to="/admin">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-xl px-8 h-14 text-lg shadow-lg shadow-accent/30 hover:shadow-xl hover:shadow-accent/40 transition-all duration-300 hover:-translate-y-1">
                  Get Started <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <a href={`tel:${BUSINESS_INFO.phone1}`}>
                <Button size="lg" variant="outline" className="border-2 border-white bg-white/10 text-white hover:bg-white hover:text-primary font-semibold rounded-xl px-8 h-14 text-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1">
                  <Phone className="mr-2 w-5 h-5" /> Call Now
                </Button>
              </a>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
              <ChevronDown className="w-6 h-6 text-white/50" />
            </div>
          </div>
        </div>
        
        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(var(--background))"/>
          </svg>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-8 bg-muted/30 border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Shield className="w-6 h-6 text-primary" />
              <span className="font-medium">ISPM-15 Certified</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Star className="w-6 h-6 text-accent" />
              <span className="font-medium">Premium Quality</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Truck className="w-6 h-6 text-success" />
              <span className="font-medium">Pan-India Delivery</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Our Platform
            </span>
            <h3 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Complete Business <span className="text-gradient-primary">Management</span>
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Streamline your wooden pallet manufacturing business with our comprehensive management system
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 stagger-children">
            <div className="feature-card text-center group">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Package className="w-8 h-8 text-primary" />
              </div>
              <h4 className="font-display text-xl font-bold text-foreground mb-3">Inventory Management</h4>
              <p className="text-muted-foreground">
                Track all products, wood types, dimensions, and stock levels in real-time with smart alerts
              </p>
            </div>
            
            <div className="feature-card text-center group">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Calculator className="w-8 h-8 text-accent" />
              </div>
              <h4 className="font-display text-xl font-bold text-foreground mb-3">CFT Calculator</h4>
              <p className="text-muted-foreground">
                Automatic cubic feet calculation for accurate pricing and instant quotations
              </p>
            </div>
            
            <div className="feature-card text-center group">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-success/20 to-success/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <FileCheck className="w-8 h-8 text-success" />
              </div>
              <h4 className="font-display text-xl font-bold text-foreground mb-3">GST Invoicing</h4>
              <p className="text-muted-foreground">
                Generate GST-compliant PDF invoices with payment tracking and complete history
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/50 to-background"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
              Product Range
            </span>
            <h3 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Quality <span className="text-gradient-accent">Wood Products</span>
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Specializing in EURO 2-Way, 4-Way and CP1 to CP9 pallets, along with customised solutions
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger-children">
            {[
              { name: 'EURO 2-Way Pallets', icon: '📦' },
              { name: 'EURO 4-Way Pallets', icon: '🔲' },
              { name: 'CP1-CP9 Pallets', icon: '🪵' },
              { name: 'Wooden Boxes', icon: '📤' },
              { name: 'Wooden Crates', icon: '🗃️' },
              { name: 'Custom Packaging', icon: '✨' },
              { name: 'Jungle Wood', icon: '🌲' },
              { name: 'Pine Wood', icon: '🌴' },
            ].map((product, index) => (
              <div
                key={product.name}
                className="group relative bg-card rounded-2xl p-6 text-center border border-border hover:border-primary/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl cursor-pointer"
              >
                <div className="text-3xl mb-3 group-hover:scale-125 transition-transform duration-300">
                  {product.icon}
                </div>
                <p className="font-medium text-foreground">{product.name}</p>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-1.5 rounded-full bg-success/10 text-success text-sm font-medium mb-4">
                Contact Us
              </span>
              <h3 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                Get In <span className="text-gradient-primary">Touch</span>
              </h3>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 stagger-children">
              <a href={`tel:${BUSINESS_INFO.phone1}`} className="feature-card text-center group cursor-pointer">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <p className="font-semibold text-foreground text-lg">{BUSINESS_INFO.phone1}</p>
                <p className="text-muted-foreground">{BUSINESS_INFO.phone2}</p>
              </a>
              
              <a href={`mailto:${BUSINESS_INFO.email}`} className="feature-card text-center group cursor-pointer">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Mail className="w-6 h-6 text-accent" />
                </div>
                <p className="font-semibold text-foreground break-all">{BUSINESS_INFO.email}</p>
              </a>
              
              <div className="feature-card text-center group">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-success/20 to-success/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="w-6 h-6 text-success" />
                </div>
                <p className="font-semibold text-foreground">{BUSINESS_INFO.location}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 hero-gradient opacity-95"></div>
        <div className="absolute inset-0 hero-overlay"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h3 className="font-display text-3xl md:text-5xl font-bold mb-6">
              Ready to Streamline Your Business?
            </h3>
            <p className="text-lg text-white/80 mb-8">
              Start managing your wooden pallet business efficiently today
            </p>
            <Link to="/admin">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-xl px-10 h-14 text-lg shadow-lg shadow-accent/30 hover:shadow-xl hover:shadow-accent/40 transition-all duration-300 hover:-translate-y-1">
                Access Admin Panel <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-secondary-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img src={logo} alt="Logo" className="w-12 h-12 rounded-xl object-cover ring-2 ring-white/20" />
              <div>
                <p className="font-display font-bold text-lg">{BUSINESS_INFO.name}</p>
                <p className="text-sm text-secondary-foreground/70">Owners: {BUSINESS_INFO.owner}, Mr. Prasad Nandgaonkar</p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-secondary-foreground/70 italic max-w-md">
                "We believe that while price is forgotten, quality is remembered for a long time."
              </p>
              <p className="text-xs text-secondary-foreground/50 mt-2">
                © {new Date().getFullYear()} {BUSINESS_INFO.name}. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
