import { useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import Panel from './Panel';
import DialogHost from './DialogHost';
import { Button, inputClass, labelClass } from './ui';

// Only accounts listed in the Firestore `admins` collection get in (see README).
export default function AdminApp() {
  const [session, setSession] = useState({ status: 'loading' }); // loading | signedOut | denied | admin

  useEffect(() => onAuthStateChanged(auth, async (user) => {
    if (!user) {
      setSession({ status: 'signedOut' });
      return;
    }
    try {
      const adminDoc = await getDoc(doc(db, 'admins', user.uid));
      setSession({ status: adminDoc.exists() ? 'admin' : 'denied', user });
    } catch {
      setSession({ status: 'denied', user });
    }
  }), []);

  if (session.status === 'admin') {
    return (
      <>
        <Panel />
        <DialogHost />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex items-center justify-center safe-x py-4">
      <div className="glass w-full max-w-sm p-8">
        <div className="flex items-center gap-2 mb-8">
          <img src="/logo.png" alt="" className="w-8 h-8 object-contain" />
          <span className="font-bold text-lg tracking-[0.2em] uppercase">PlayTime <span className="text-accent">Admin</span></span>
        </div>
        {session.status === 'loading' && <p className="text-[10px] font-bold text-muted tracking-widest uppercase animate-pulse">Loading…</p>}
        {session.status === 'signedOut' && <SignIn />}
        {session.status === 'denied' && <NotAdmin user={session.user} />}
      </div>
    </div>
  );
}

function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch {
      setError('Wrong email or password.');
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <label htmlFor="email" className={labelClass}>Email</label>
        <input id="email" type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label htmlFor="password" className={labelClass}>Password</label>
        <input id="password" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
      </div>
      {error && <p className="text-sm text-accent font-medium">{error}</p>}
      <Button type="submit" disabled={busy} className="w-full py-4">{busy ? 'Signing in…' : 'Sign in'}</Button>
    </form>
  );
}

function NotAdmin({ user }) {
  return (
    <div>
      <p className="text-sm text-muted mb-4">
        <span className="font-bold text-foreground">{user.email}</span> isn't an admin yet. In the Firebase console, open Firestore and add a document to the <span className="font-bold text-foreground">admins</span> collection with this ID:
      </p>
      <p className="font-mono text-xs bg-background border border-border p-3 break-all select-all mb-6">{user.uid}</p>
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" onClick={() => signOut(auth)}>Sign out</Button>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    </div>
  );
}
