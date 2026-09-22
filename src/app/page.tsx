import Link from "next/link";
import { Leaf } from "lucide-react";

export default function Home() {
  return (
    <main className="screen-container" style={{ justifyContent: "center", alignItems: "center", backgroundColor: "var(--color-primary)", color: "white" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
        <Leaf size={64} style={{ marginBottom: "1rem" }} />
        <h1 className="title" style={{ color: "white" }}>MiPlan</h1>
        <p className="subtitle" style={{ color: "rgba(255,255,255,0.8)" }}>
          Construí un plan que se adapte a vos.
        </p>
      </div>
      
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "1rem", paddingBottom: "2rem" }}>
        <Link href="/register" style={{ width: "100%" }}>
          <button className="btn-secondary">Comenzar</button>
        </Link>
        <Link href="/login" style={{ width: "100%" }}>
          <button style={{ 
            width: "100%", 
            padding: "1rem", 
            backgroundColor: "transparent", 
            color: "white", 
            fontWeight: 600,
            borderRadius: "var(--border-radius-pill)",
            border: "1px solid rgba(255,255,255,0.3)"
          }}>
            Ya tengo una cuenta
          </button>
        </Link>
      </div>
    </main>
  );
}
