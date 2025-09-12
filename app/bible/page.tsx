
"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface BibleBook {
  id: string;
  name: string;
  file: string;
  chapters: number;
  testament: "AT" | "NT";
}

export default function BiblePage() {
  const [bibleBooks, setBibleBooks] = useState<BibleBook[]>([]);
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [verses, setVerses] = useState<any[]>([]);

  // Charger la liste complète des livres
  useEffect(() => {
    fetch("/bible/bibleBooksList.json")
      .then((res) => res.json())
      .then((data: BibleBook[]) => setBibleBooks(data));
  }, []);

  // Séparer AT/NT
  const atBooks = bibleBooks.filter((b: BibleBook) => b.testament === "AT");
  const ntBooks = bibleBooks.filter((b: BibleBook) => b.testament === "NT");
  const chapters = selectedBook ? Array.from({ length: selectedBook.chapters }, (_, i) => i + 1) : [];

  // Charger les versets réels depuis le JSON public
  useEffect(() => {
    if (selectedBook && selectedChapter) {
      fetch(`/bibleCathliqueCrampon/${selectedBook.file}`)
        .then((res) => res.json())
        .then((data) => {
          const chapterData = data.chapters?.[selectedChapter - 1];
          setVerses(chapterData?.verses || []);
        })
        .catch(() => setVerses([]));
    } else {
      setVerses([]);
    }
  }, [selectedBook, selectedChapter]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8 animate-slide-in-right">
        <h1 className="text-3xl font-bold text-liturgical-primary mb-2 text-center drop-shadow">Sainte Bible</h1>
        <p className="text-muted-foreground text-center mb-6">Parole de Dieu pour nourrir votre foi</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Panneau Livres */}
        <div className="lg:col-span-1 space-y-4 animate-slide-in-left">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border p-4">
            <h2 className="text-lg font-semibold text-liturgical-primary mb-2">Livres de la Bible</h2>
            <div>
              <h4 className="font-semibold text-sm text-liturgical-text mb-2">Ancien Testament</h4>
              <div className="grid grid-cols-1 gap-1 max-h-40 overflow-y-auto">
                {atBooks.map((book: BibleBook) => (
                  <Button key={book.id} variant={selectedBook?.id === book.id ? "default" : "ghost"} size="sm" className="justify-start text-xs hover-lift" onClick={() => { setSelectedBook(book); setSelectedChapter(null); }}>
                    {book.name}
                  </Button>
                ))}
              </div>
              <h4 className="font-semibold text-sm text-liturgical-text mt-4 mb-2">Nouveau Testament</h4>
              <div className="grid grid-cols-1 gap-1 max-h-40 overflow-y-auto">
                {ntBooks.map((book: BibleBook) => (
                  <Button key={book.id} variant={selectedBook?.id === book.id ? "default" : "ghost"} size="sm" className="justify-start text-xs hover-lift" onClick={() => { setSelectedBook(book); setSelectedChapter(null); }}>
                    {book.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* Panneau principal : Chapitres & Versets */}
        <div className="lg:col-span-2 space-y-6 animate-slide-in-right">
          {/* Sélecteur de chapitre */}
          {selectedBook && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border p-6 mb-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
                <h2 className="text-2xl font-bold text-liturgical-primary">{selectedBook.name}{selectedChapter ? ` – Chapitre ${selectedChapter}` : ""}</h2>
                <div className="flex flex-wrap gap-2">
                  {chapters.map((ch: number) => (
                    <Button key={ch} size="sm" variant={selectedChapter === ch ? "default" : "outline"} onClick={() => setSelectedChapter(ch)}>
                      {ch}
                    </Button>
                  ))}
                </div>
              </div>
              {/* Versets */}
              {selectedChapter && (
                <div className="prose max-w-none mt-6">
                  {Array.isArray(verses) && verses.length > 0 ? (
                    verses.map((v: any, idx: number) => {
                      if (typeof v === "object" && v !== null && ("text" in v || "verse" in v)) {
                        return (
                          <div key={idx} className="flex items-start gap-2 mb-2">
                            <span className="font-mono text-xs text-gray-400 w-8 text-right select-none pt-1">{v.verse || idx + 1}</span>
                            <span className="text-base text-liturgical-text leading-relaxed">{v.text || JSON.stringify(v)}</span>
                          </div>
                        );
                      } else if (typeof v === "string" || typeof v === "number") {
                        return (
                          <div key={idx} className="flex items-start gap-2 mb-2">
                            <span className="font-mono text-xs text-gray-400 w-8 text-right select-none pt-1">{idx + 1}</span>
                            <span className="text-base text-liturgical-text leading-relaxed">{v}</span>
                          </div>
                        );
                      } else {
                        return null;
                      }
                    })
                  ) : (
                    selectedBook && selectedChapter ? (
                      <div className="text-muted-foreground italic">Aucun verset trouvé pour ce chapitre.</div>
                    ) : null
                  )}
                </div>
              )}
            </div>
          )}
          {/* Message d'accueil */}
          {!selectedBook && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border p-8 text-center">
              <h3 className="text-xl font-semibold text-liturgical-primary mb-2">Bienvenue dans la Bible</h3>
              <p className="text-muted-foreground mb-4">Choisissez un livre dans le panneau de gauche pour commencer à lire la Parole de Dieu.</p>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                <span className="bg-liturgical-primary/20 text-liturgical-primary rounded-full px-3 py-1 text-xs font-semibold">73 livres</span>
                <span className="bg-liturgical-primary/20 text-liturgical-primary rounded-full px-3 py-1 text-xs font-semibold">1189 chapitres</span>
                <span className="bg-liturgical-primary/20 text-liturgical-primary rounded-full px-3 py-1 text-xs font-semibold">31 102 versets</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
