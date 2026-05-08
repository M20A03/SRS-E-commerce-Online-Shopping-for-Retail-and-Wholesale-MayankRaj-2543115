// AuthContext modifications: added email verification after registration and email verified check on login
import { sendEmailVerification } from 'firebase/auth';

// Inside register function after setDoc
await setDoc(doc(db, 'users', result.user.uid), {
  email,
  displayName: displayName || '',
  firstName: derived.firstName,
  lastName: derived.lastName,
  isAdmin: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});
// Send email verification
await sendEmailVerification(result.user);

// Inside login function after signInWithEmailAndPassword
await signInWithEmailAndPassword(auth, email, password);
if (!auth.currentUser.emailVerified) {
  await signOut(auth);
  return { success: false, error: 'Please verify your email before logging in. Check your inbox for the verification link.' };
}
return { success: true };
