import React, { useEffect } from 'react';
import { Link } from 'react-router-dom'; // Assuming you use React Router for navigation

const LandingPage = () => {
  useEffect(() => {
    document.title = 'SideHustleGig — Turn Skills into Earnings';
  }, []);

  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="landing-container">
          <div className="logo-container">
            <div className="logo-icon">SH</div>
            <div>
              <a href="/" className="logo-text">SideHustleGig</a>
              <div className="logo-subtext">Campus gigs. Real earnings.</div>
            </div>
          </div>
          <nav className="landing-nav">
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <a href="#testimonials">Testimonials</a>
            <Link to="/login" className="join-now-btn">Join Now</Link>
          </nav>
          <button id="mobileMenuBtn" className="mobile-menu-btn">☰</button>
        </div>
      </header>

      <main className="landing-main">
        {/* Hero Section */}
        <section className="hero-section-landing">
          <div>
            <h1>Turn your skills into earnings — anytime, anywhere.</h1>
            <p>Join SideHustleGig, a trusted campus-based gig platform where students, freelancers and local businesses connect for short tasks, real projects and meaningful income.</p>
            <div className="hero-actions-landing">
              <Link to="/login" className="hero-btn-landing primary">Find a Gig</Link>
              <Link to="/login" className="hero-btn-landing secondary">Post a Gig</Link>
            </div>
            <ul className="hero-features">
              <li><span className="feature-dot"></span> Verified student profiles</li>
              <li><span className="feature-dot"></span> Secure payments (Razorpay)</li>
              <li><span className="feature-dot"></span> Micro-tasks (₹20–₹500)</li>
              <li><span className="feature-dot"></span> Skill badges & ratings</li>
            </ul>
          </div>
          <div className="hero-image-container">
              <img src="https://images.unsplash.com/photo-1537432376769-00a6b6d1a4d8?q=80&w=800&auto=format&fit=crop" alt="students collaborating" className="rounded-lg w-full h-48 object-cover" />
              <div className="dashboard-preview">
                <div>Dashboard preview</div>
                <div className="preview-stats">
                  <div>Gigs: 24</div>
                  <div>Applied: 5</div>
                </div>
              </div>
          </div>
        </section>

        {/* Key Features */}
        <section id="features" className="landing-section">
          <h2>Key Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>Post & Find Gigs</h3>
              <p>Create listings in minutes and discover local micro-tasks that fit your schedule.</p>
            </div>
            <div className="feature-card">
              <h3>Verified Profiles</h3>
              <p>College-based verification builds trust — hire or work with confidence.</p>
            </div>
            <div className="feature-card">
              <h3>Secure Payments</h3>
              <p>Integrated payments (Razorpay) ensure fast and transparent payouts.</p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="landing-section how-it-works">
          <h2>How it works</h2>
          <ol>
            <li><strong>Post:</strong> Businesses or students post micro-gigs in seconds.</li>
            <li><strong>Apply:</strong> Students apply and showcase samples/portfolio.</li>
            <li><strong>Complete & Pay:</strong> Work is delivered, reviewed, and paid securely.</li>
          </ol>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="landing-section">
          <h2>What our users say</h2>
          <div className="testimonials-grid">
            <blockquote>
              <p>“I found my first design project here — earned ₹1,000 in a week!”</p>
              <div>— Rahul, BVC College</div>
            </blockquote>
            <blockquote>
              <p>“Perfect for hiring quick help for my shop’s poster.”</p>
              <div>— Srinivas, Small Business Owner</div>
            </blockquote>
          </div>
        </section>

        {/* Signup Form */}
        <section id="signup" className="landing-section signup-section">
          <h2>Get started — it’s free</h2>
          <p>Sign up to find gigs or post your first task in minutes.</p>
          <form>
            <input type="text" placeholder="Full name" />
            <input type="email" placeholder="Email" />
            <select>
              <option>I'm a student</option>
              <option>I'm a business</option>
              <option>I'm a freelancer</option>
            </select>
            <button type="submit">Join SideHustleGig</button>
          </form>
        </section>

      </main>

      <footer className="landing-footer">
        <div>© {new Date().getFullYear()} SideHustleGig — Your Side Hustle Starts Here.</div>
        <div className="social-links">
          <a href="#">Instagram</a>
          <a href="#">LinkedIn</a>
          <a href="#">YouTube</a>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;