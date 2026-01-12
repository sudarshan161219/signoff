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
  Twitter,
  Coffee,
  UploadCloud,
  ThumbsUp,
  Send,
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

        {/* RIGHT: Social Links */}
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <a
            href="https://x.com/buildwithSud"
            target="_blank"
            rel="noreferrer"
            title="Follow updates on X"
            className={styles.navLink} // Ensure this class handles hover states
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <Twitter size={16} />
            <span style={{ fontSize: "0.875rem" }}>Updates</span>
          </a>

          <a
            href="https://buymeacoffee.com/sudarshanhosalli"
            target="_blank"
            rel="noreferrer"
            title="Support the project"
            className={styles.navLink}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <Coffee size={16} />
            <span style={{ fontSize: "0.875rem" }}>Support</span>
          </a>
        </div>
      </nav>

      {/* HERO */}
      <main className={styles.hero}>
        <div className={styles.badge}>
          <span className={styles.pulseDot} />
          v1.0 Public Beta
        </div>

        <h1 className={styles.title}>
          The friction-free way to <br />
          <span className={styles.gradientText}>get client approvals.</span>
        </h1>

        <p className={styles.subtitle}>
          Stop chasing emails. Create a secure workspace in seconds, upload your
          work, and get a "Yes" or "No". No sign-ups required.
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

      {/* HOW IT WORKS (Crucial for explaining the product workflow) */}
      <section className={styles.stepsSection}>
        <h2 className={styles.sectionTitle}>How it works</h2>
        <div className={styles.stepsGrid}>
          <div className={styles.stepCard}>
            <div className={styles.stepIcon}>
              <UploadCloud />
            </div>
            <h3>1. Upload</h3>
            <p>Create a temporary workspace and drag-and-drop your assets.</p>
          </div>
          <div className={styles.stepArrow}>
            <ArrowRight />
          </div>
          <div className={styles.stepCard}>
            <div className={styles.stepIcon}>
              <Send />
            </div>
            <h3>2. Share</h3>
            <p>Send the unique secure link to your client. No login needed.</p>
          </div>
          <div className={styles.stepArrow}>
            <ArrowRight />
          </div>
          <div className={styles.stepCard}>
            <div className={styles.stepIcon}>
              <ThumbsUp />
            </div>
            <h3>3. Approve</h3>
            <p>Clients view files and hit "Approve" or request changes.</p>
          </div>
        </div>
      </section>

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
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            alignItems: "center",
          }}
        >
          <span>
            © {new Date().getFullYear()} SignOff. Built for Freelancers.
          </span>

          {/* Subtle footer links */}
          <div style={{ display: "flex", gap: "1.5rem", marginTop: "0.5rem" }}>
            <a
              href="https://x.com/buildwithSud"
              target="_blank"
              rel="noreferrer"
              style={{
                opacity: 0.6,
                fontSize: "0.8rem",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              Built by Sudarshan
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
