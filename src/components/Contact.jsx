import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SmoothInput } from './SmoothInput';
import { Reveal, RevealGroup, RevealItem, RevealWords } from './Reveal';
import { submitContact } from '../lib/api';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [interest, setInterest] = useState('');
  
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    try {
      await submitContact({ name, email, interest });
      setStatus('success');
    } catch (err) {
      console.error('Submission error:', err);
      setErrorMessage('Could not reach the registry. Please try again.');
      setStatus('error');
    }
  };

  return (
    <section id="contact" className="relative bg-background px-6 pb-40 pt-24 text-ink md:px-12 md:pb-48 md:pt-48">
      <div className="motion-blur max-w-4xl mx-auto text-center">
        <Reveal y={24} blur={8}>
          <span className="text-xs uppercase tracking-widest text-muted block mb-6">Database Registry</span>
        </Reveal>
        <RevealWords
          as="h2"
          text="Join the Matrix."
          stagger={0.07}
          className="block text-5xl md:text-7xl font-medium tracking-tighter mb-16"
        />
        <div>
          {status !== 'success' ? (
            <RevealGroup as="form" onSubmit={handleSubmit} stagger={0.1} className="text-left space-y-12 relative">
              {status === 'error' && (
                <div className="absolute -top-12 left-0 w-full text-center text-red-500 text-sm tracking-widest uppercase">
                  {errorMessage}
                </div>
              )}

              <RevealItem><SmoothInput
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
              /></RevealItem>

              <RevealItem><SmoothInput
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
              /></RevealItem>

              <RevealItem><SmoothInput
                type="text"
                value={interest}
                onChange={(e) => setInterest(e.target.value)}
                placeholder="Area of Research (Optional)"
              /></RevealItem>

              <RevealItem className="flex justify-between items-center pt-8">
                <p className="text-xs text-muted max-w-xs">
                  By submitting, your data is processed and stored in our secure public registry.
                </p>
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="flex items-center gap-4 text-xl font-medium group hoverable disabled:opacity-50"
                >
                  <span>
                    {status === 'submitting' ? 'Securing...' : 'Initialize'}
                  </span>
                  <div className="w-12 h-12 rounded-full border border-ink flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:bg-ink group-hover:text-background group-hover:translate-x-1 group-hover:scale-110">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              </RevealItem>
            </RevealGroup>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center py-20 border border-ink/10 rounded-2xl bg-surface"
            >
              <div className="w-20 h-20 mx-auto bg-ink rounded-full flex items-center justify-center text-background mb-6">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <h3 className="text-3xl font-medium tracking-tighter mb-4 text-ink">Data Secured</h3>
              <p className="text-muted">Your profile has been added to our active registry.</p>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
