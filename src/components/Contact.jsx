import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SmoothInput } from './SmoothInput';

// Lazy load Firebase packages to prevent bundle Bloat or build errors if Firebase is unused/unconfigured
let firebaseApp, db, auth, isFirebaseReady = false;

const initFirebase = async () => {
  if (typeof window === 'undefined') return;
  const firebaseConfigStr = window.__firebase_config;

  if (firebaseConfigStr) {
    try {
      const { initializeApp } = await import('firebase/app');
      const { getFirestore } = await import('firebase/firestore');
      const { getAuth, signInAnonymously, signInWithCustomToken } = await import('firebase/auth');

      const firebaseConfig = JSON.parse(firebaseConfigStr);
      firebaseApp = initializeApp(firebaseConfig);
      db = getFirestore(firebaseApp);
      auth = getAuth(firebaseApp);

      try {
        if (typeof window.__initial_auth_token !== 'undefined') {
          await signInWithCustomToken(auth, window.__initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
        isFirebaseReady = true;
      } catch (authErr) {
        console.error("Firebase Auth Error:", authErr);
      }
    } catch (err) {
      console.error("Firebase Init Error:", err);
    }
  } else {
    console.warn("No Firebase configuration found. Database features will be simulated.");
  }
};

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [interest, setInterest] = useState('');
  
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    initFirebase();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    const appId = window.__app_id || 'cip-zypsy-clone';

    if (!isFirebaseReady || !auth || !db) {
      // Demo mode fallback
      setTimeout(() => {
        setStatus('success');
      }, 1500);
      return;
    }

    try {
      const { collection, addDoc } = await import('firebase/firestore');
      const contactsRef = collection(db, 'artifacts', appId, 'public', 'data', 'contacts');
      await addDoc(contactsRef, {
        name,
        email,
        interest,
        timestamp: new Date().toISOString(),
        userId: auth.currentUser ? auth.currentUser.uid : 'anonymous'
      });

      setStatus('success');
    } catch (err) {
      console.error("Submission error:", err);
      setErrorMessage("Database connection error. Try again.");
      setStatus('error');
    }
  };

  const scrollReveal = {
    hidden: { opacity: 0, y: 40, filter: "blur(12px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 1, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section id="contact" className="py-32 md:py-48 px-6 md:px-12 bg-background relative text-white">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={scrollReveal}
        >
          <span className="text-xs uppercase tracking-widest text-muted block mb-6">Database Registry</span>
          <h2 className="text-5xl md:text-7xl font-medium tracking-tighter mb-16">Join the Matrix.</h2>

          {status !== 'success' ? (
            <form onSubmit={handleSubmit} className="text-left space-y-12 relative">
              {status === 'error' && (
                <div className="absolute -top-12 left-0 w-full text-center text-red-500 text-sm tracking-widest uppercase">
                  {errorMessage}
                </div>
              )}

              <SmoothInput
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
              />

              <SmoothInput
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
              />

              <SmoothInput
                type="text"
                value={interest}
                onChange={(e) => setInterest(e.target.value)}
                placeholder="Area of Research (Optional)"
              />

              <div className="flex justify-between items-center pt-8">
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
                  <div className="w-12 h-12 rounded-full border border-white flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              </div>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center py-20 border border-white/10 rounded-2xl bg-surface"
            >
              <div className="w-20 h-20 mx-auto bg-white rounded-full flex items-center justify-center text-black mb-6">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <h3 className="text-3xl font-medium tracking-tighter mb-4 text-white">Data Secured</h3>
              <p className="text-muted">Your profile has been added to our active registry.</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
