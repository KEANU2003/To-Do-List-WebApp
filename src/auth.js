import { supabase } from './supabase.js';

export class AuthManager {
  constructor() {
    this.user = null;
    this.setupAuthListener();
  }

  setupAuthListener() {
    supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        this.user = session?.user ?? null;
        this.updateUIForAuth();
      })();
    });
  }

  async initialize() {
    const { data: { session } } = await supabase.auth.getSession();
    this.user = session?.user ?? null;
    this.updateUIForAuth();
  }

  async signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  isAuthenticated() {
    return !!this.user;
  }

  updateUIForAuth() {
    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('app-container');
    const userEmail = document.getElementById('user-email');

    if (this.isAuthenticated()) {
      authContainer.style.display = 'none';
      appContainer.style.display = 'block';
      if (userEmail) {
        userEmail.textContent = this.user.email;
      }
      window.dispatchEvent(new Event('user-authenticated'));
    } else {
      authContainer.style.display = 'flex';
      appContainer.style.display = 'none';
    }
  }
}
