import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./index.module.css";
import { Feature } from "@/components/feature/Feature";
import api from "@/lib/api/api";
import {
  ArrowRight,
  Zap,
  Shield,
  MousePointer2,
  Loader2,
  CheckCircle2,
} from "lucide-react";

export const Landing = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || !name.trim()) return;

    setLoading(true);

    try {
      const { data } = await api.post<{ data: { adminToken: string } }>(
        "/projects",
        { name }
      );

      const { adminToken } = data.data;

      localStorage.setItem("signoff_admin_token", adminToken);
      navigate(`/dashboard/${adminToken}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message ?? "Failed to create project");
      } else {
        alert("Unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* NAVBAR */}
      <nav className={styles.nav}>
        <div className={styles.brand}>
          <div className={styles.logo}>
            <CheckCircle2 size={20} strokeWidth={3} />
          </div>
          SignOff
        </div>

        {/* <a
          href="https://github.com/yourusername"
          target="_blank"
          className={styles.navLink}
        >
          GitHub
        </a> */}
      </nav>

      {/* HERO */}
      <main className={styles.hero}>
        <div className={styles.badge}>
          <span className={styles.pulseDot} />
          v1.0 Public Beta
        </div>

        <h1 className={styles.title}>
          Client approvals, <br />
          <span className={styles.gradientText}>without follow-ups.</span>
        </h1>

        <p className={styles.subtitle}>
          Share a secure approval link. No sign-up.
        </p>

        <form onSubmit={handleStart} className={styles.form}>
          <div className={styles.formGlow} />
          <div className={styles.formInner}>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Project Name (e.g. Nike Logo v2)"
              className={styles.input}
              disabled={loading}
            />

            <button
              type="submit"
              disabled={!name || loading}
              className={styles.button}
            >
              {loading ? (
                <Loader2 className={styles.spinner} size={18} />
              ) : (
                "Start"
              )}
              {!loading && <ArrowRight size={18} />}
            </button>
          </div>

          <p className={styles.helperText}>
            Press Enter to create workspace. Free forever.
          </p>
        </form>
      </main>

      {/* FEATURES */}
      <section className={styles.features}>
        <div className={styles.featuresGrid}>
          <Feature
            icon={<Zap />}
            title="Lightning Fast"
            text="Skip the login. Type a project name and get a workspace instantly."
          />
          <Feature
            icon={<Shield />}
            title="Secure by Design"
            text="Private Cloudflare R2 storage with secure, time-limited access."
          />
          <Feature
            icon={<MousePointer2 />}
            title="Client Friendly"
            text="Clients approve or request changes without creating accounts."
          />
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        © {new Date().getFullYear()} SignOff. Built for Freelancers.
      </footer>
    </div>
  );
};
