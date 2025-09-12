"use client"


import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

export default function SaintsPage() {
  const [saints, setSaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/saints")
      .then((res) => res.json())
      .then((data) => {
        setSaints(data.sources || []);
        setError(null);
      })
      .catch(() => setError("Impossible de charger les saints du jour."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-liturgical-primary mb-6 text-center">Saint du jour</h1>
      {loading && <div className="text-center text-muted-foreground">Chargement…</div>}
      {error && <div className="text-center text-red-500">{error}</div>}
      {saints.length > 0 && saints.map((saint, idx) => (
        <Card key={saint.source} className="p-6 flex flex-col items-center gap-4 mb-8">
          <div className="w-full flex flex-col items-center">
            <span className="text-xs text-muted-foreground mb-2">Source : {saint.source}</span>
            {saint.image && <img src={saint.image} alt={saint.name} className="w-40 h-40 object-contain rounded-xl shadow" />}
            <h2 className="text-xl font-bold text-liturgical-primary text-center mt-2">{saint.name}</h2>
            {saint.fete && <div className="text-sm text-center text-muted-foreground mb-2">Fête : {saint.fete}</div>}
            <p className="text-base text-center text-muted-foreground whitespace-pre-line mt-2">{saint.description || saint.bio}</p>
            {saint.citation && <div className="italic text-center text-muted-foreground mt-2">« {saint.citation} »</div>}
          </div>
        </Card>
      ))}
    </div>
  );
}
