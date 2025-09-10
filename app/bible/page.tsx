"use client"

import { useState, useEffect, useRef } from "react"
// On ne charge plus statiquement geneseData, on utilisera un import dynamique
import { Search, Book, Star, Bookmark, ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ReadingCard } from "@/components/reading-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface BibleBook {
  id: string
  name: string
  chapters: number
  testament: "AT" | "NT"
}

interface BibleVerse {
  book: string
  chapter: number
  verse: number
  text: string
}

const bibleBooks: BibleBook[] = [
  // Ancien Testament
  { id: "gn", name: "Genèse", chapters: 50, testament: "AT" },
  { id: "ex", name: "Exode", chapters: 40, testament: "AT" },
  { id: "lv", name: "Lévitique", chapters: 27, testament: "AT" },
  { id: "nb", name: "Nombres", chapters: 36, testament: "AT" },
  { id: "dt", name: "Deutéronome", chapters: 34, testament: "AT" },
  { id: "jos", name: "Josué", chapters: 24, testament: "AT" },
  { id: "jg", name: "Juges", chapters: 21, testament: "AT" },
  { id: "rt", name: "Ruth", chapters: 4, testament: "AT" },
  { id: "1s", name: "1 Samuel", chapters: 31, testament: "AT" },
  { id: "2s", name: "2 Samuel", chapters: 24, testament: "AT" },
  { id: "1r", name: "1 Rois", chapters: 22, testament: "AT" },
  { id: "2r", name: "2 Rois", chapters: 25, testament: "AT" },
  { id: "ps", name: "Psaumes", chapters: 150, testament: "AT" },
  { id: "pr", name: "Proverbes", chapters: 31, testament: "AT" },
  { id: "is", name: "Isaïe", chapters: 66, testament: "AT" },
  { id: "jr", name: "Jérémie", chapters: 52, testament: "AT" },
  { id: "ez", name: "Ézéchiel", chapters: 48, testament: "AT" },
  { id: "dn", name: "Daniel", chapters: 14, testament: "AT" },

export default function BiblePage() {
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null)
  const [selectedChapter, setSelectedChapter] = useState<number>(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<BibleVerse[]>([])
  const [chapterContent, setChapterContent] = useState<string>("")
  const [chapterVerses, setChapterVerses] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [bookmarks, setBookmarks] = useState<string[]>([])

  // Mapping des IDs courts vers les noms de fichiers
  const bookMap: { [key: string]: string } = {
    'gn': 'Genesis',
    'ex': 'Exodus',
    'lv': 'Leviticus',
    'nb': 'Numbers',
    'dt': 'Deuteronomy',
    'jos': 'Joshua',
    'jg': 'Judges',
    'rt': 'Ruth',
    '1s': 'I_Samuel',
    '2s': 'II_Samuel',
    '1r': 'I_Kings',
    '2r': 'II_Kings',
    '1ch': 'I_Chronicles',
    '2ch': 'II_Chronicles',
    'esd': 'Ezra',
    'ne': 'Nehemiah',
    'tb': 'Tobit',
    'jdt': 'Judith',
    'est': 'Esther',
    'jb': 'Job',
    'ps': 'Psalms',
    'pr': 'Proverbs',
    'qo': 'Ecclesiastes',
    'ct': 'Song_of_Solomon',
    'sg': 'Wisdom',
    'si': 'Sirach',
    'is': 'Isaiah',
    'jr': 'Jeremiah',
    'lm': 'Lamentations',
    'ba': 'Baruch',
    'ez': 'Ezekiel',
    'dn': 'Daniel',
    'os': 'Hosea',
    'jl': 'Joel',
    'am': 'Amos',
    'ab': 'Obadiah',
    'jon': 'Jonah',
    'mi': 'Micah',
    'na': 'Nahum',
    'ha': 'Habakkuk',
    'so': 'Zephaniah',
    'ag': 'Haggai',
    'za': 'Zechariah',
    'ml': 'Malachi',
    '1m': 'I_Maccabees',
    '2m': 'II_Maccabees',
    'mt': 'Matthew',
    'mc': 'Mark',
    'lc': 'Luke',
    'jn': 'John',
    'ac': 'Acts',
    'rm': 'Romans',
    '1co': 'I_Corinthians',
    '2co': 'II_Corinthians',
    'ga': 'Galatians',
    'ep': 'Ephesians',
    'ph': 'Philippians',
    'col': 'Colossians',
    '1th': 'I_Thessalonians',
    '2th': 'II_Thessalonians',
    '1tm': 'I_Timothy',
    '2tm': 'II_Timothy',
    'tt': 'Titus',
    'phm': 'Philemon',
    'he': 'Hebrews',
    'jc': 'James',
    '1p': 'I_Peter',
    '2p': 'II_Peter',
    '1jn': 'I_John',
    '2jn': 'II_John',
    '3jn': 'III_John',
    'jude': 'Jude',
    'ap': 'Revelation_of_John'
  };

  // Fonction pour charger un chapitre
  const fetchChapterContent = async (bookId: string, chapter: number) => {
    setLoading(true)
    try {
      const fileName = bookMap[bookId];
      if (!fileName) {
        throw new Error(`Book ID ${bookId} not found in mapping`);
      }
      const data = await import(`../../public/bibleCathliqueCrampon/${fileName}.json`);
      if (data && data.chapters) {
        const chapObj = data.chapters.find((c: any) => c.chapter === chapter);
        const verses = chapObj ? chapObj.verses : [];
        setChapterVerses(verses);
        setChapterContent("");
      } else {
        setChapterContent("Aucun contenu trouvé");
        setChapterVerses([]);
      }
    } catch (error) {
      setChapterContent("Erreur de chargement du chapitre");
      setChapterVerses([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (selectedBook) {
      fetchChapterContent(selectedBook.id, selectedChapter)
    }
  }, [selectedBook, selectedChapter])

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {selectedBook && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
          <h2 className="text-2xl font-bold mb-4 text-liturgical-primary">{selectedBook.name} {selectedChapter}</h2>
          <div className="space-y-2">
            {chapterVerses.length > 0 ? (
              chapterVerses.map((verse: any) => (
                <div key={verse.verse} className="flex items-start gap-2">
                  <span className="font-mono text-xs text-gray-400 w-8 text-right select-none">{verse.verse}</span>
                  <span className="text-base text-liturgical-text leading-relaxed">{verse.text}</span>
                </div>
              ))
            ) : (
              <div className="text-muted-foreground italic">Aucun verset trouvé pour ce chapitre.</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
        '2s': 'II_Samuel',
        '1r': 'I_Kings',
        '2r': 'II_Kings',
        '1ch': 'I_Chronicles',
        '2ch': 'II_Chronicles',
        'esd': 'Ezra',
        'ne': 'Nehemiah',
        'tb': 'Tobit',
        'jdt': 'Judith',
        'est': 'Esther',
        'jb': 'Job',
        'ps': 'Psalms',
        'pr': 'Proverbs',
        'qo': 'Ecclesiastes',
        'ct': 'Song_of_Solomon',
        'sg': 'Wisdom',
        'si': 'Sirach',
        'is': 'Isaiah',
        'jr': 'Jeremiah',
        'lm': 'Lamentations',
        'ba': 'Baruch',
        'ez': 'Ezekiel',
        'dn': 'Daniel',
        'os': 'Hosea',
        'jl': 'Joel',
        'am': 'Amos',
        'ab': 'Obadiah',
        'jon': 'Jonah',
        'mi': 'Micah',
        'na': 'Nahum',
        'ha': 'Habakkuk',
        'so': 'Zephaniah',
        'ag': 'Haggai',
        'za': 'Zechariah',
        'ml': 'Malachi',
        '1m': 'I_Maccabees',
        '2m': 'II_Maccabees',
        'mt': 'Matthew',
        'mc': 'Mark',
        'lc': 'Luke',
        'jn': 'John',
        'ac': 'Acts',
        'rm': 'Romans',
        '1co': 'I_Corinthians',
        '2co': 'II_Corinthians',
        'ga': 'Galatians',
        'ep': 'Ephesians',
        'ph': 'Philippians',
        'col': 'Colossians',
        '1th': 'I_Thessalonians',
        '2th': 'II_Thessalonians',
        '1tm': 'I_Timothy',
        '2tm': 'II_Timothy',
        'tt': 'Titus',
        'phm': 'Philemon',
        'he': 'Hebrews',
        'jc': 'James',
        '1p': 'I_Peter',
        '2p': 'II_Peter',
        '1jn': 'I_John',
        '2jn': 'II_John',
        '3jn': 'III_John',
        'jude': 'Jude',
        'ap': 'Revelation_of_John'
      };

      const fileName = bookMap[bookId];
      if (!fileName) {
        throw new Error(`Book ID ${bookId} not found in mapping`);
      }

      const data = await import(`../../public/bibleCathliqueCrampon/${fileName}.json`);
      
      if (data && data.chapters) {
        const chapObj = data.chapters.find((c: any) => c.chapter === chapter);
        const verses = chapObj ? chapObj.verses : [];
        setChapterVerses(verses);
        setChapterContent("");
      } else {
        setChapterContent(generateDemoContent(bookId, chapter));
        setChapterVerses([]);
      }
    } catch (error) {
      console.error('Error loading chapter:', error);
      setChapterContent(generateDemoContent(bookId, chapter));
      setChapterVerses([]);
    } finally {
      setLoading(false);
    }
  }

  // Fonction utilitaire pour contenu manquant
  const generateDemoContent = (bookId: string, chapter: number) => {
    const book = bibleBooks.find((b) => b.id === bookId)
    if (!book) return "Livre non trouvé"
    return `<div class="text-center py-8">
      <Book className=\"h-12 w-12 text-liturgical-primary mx-auto mb-4\" />
      <p class=\"text-muted-foreground\">Contenu de ${book.name} ${chapter} non trouvé dans la Bible de Jérusalem.</p>
      <p class=\"text-sm text-muted-foreground mt-2\">Merci de signaler ce bug ou d'essayer un autre chapitre.</p>
    </div>`
  }

  const searchBible = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setLoading(true)
    try {
      // Simulation de recherche - dans une vraie app, ceci utiliserait l'API AELF
      const mockResults: BibleVerse[] = [
        {
          book: "Jean",
          chapter: 3,
          verse: 16,
          text: "Car Dieu a tellement aimé le monde qu'il a donné son Fils unique, afin que quiconque croit en lui ne se perde pas, mais obtienne la vie éternelle.",
        },
        {
          book: "Matthieu",
          chapter: 5,
          verse: 14,
          text: "Vous êtes la lumière du monde. Une ville située sur une montagne ne peut être cachée.",
        },
        { book: "1 Jean", chapter: 4, verse: 8, text: "Celui qui n'aime pas n'a pas connu Dieu, car Dieu est amour." },
      ].filter((verse) => verse.text.toLowerCase().includes(query.toLowerCase()))

      setSearchResults(mockResults)
    } catch (error) {
      console.error("Erreur de recherche:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleBookmark = (reference: string) => {
    const newBookmarks = bookmarks.includes(reference)
      ? bookmarks.filter((b) => b !== reference)
      : [...bookmarks, reference]

    setBookmarks(newBookmarks)
    localStorage.setItem("bible-bookmarks", JSON.stringify(newBookmarks))
  }

  useEffect(() => {
    const savedBookmarks = localStorage.getItem("bible-bookmarks")
    if (savedBookmarks) {
      setBookmarks(JSON.parse(savedBookmarks))
    }
  }, [])

  useEffect(() => {
    if (selectedBook) {
      fetchChapterContent(selectedBook.id, selectedChapter)
    }
  }, [selectedBook, selectedChapter])

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6 animate-slide-in-right">
        <h1 className="text-3xl font-bold text-liturgical-primary mb-2">Sainte Bible</h1>
        <p className="text-muted-foreground">Parole de Dieu pour nourrir votre foi</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panneau de navigation */}
        <div className="lg:col-span-1 space-y-4 animate-slide-in-left">
          {/* Recherche */}
          <Card className="liturgical-card hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center text-liturgical-primary">
                <Search className="h-5 w-5 mr-2" />
                Rechercher
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  placeholder="Rechercher dans la Bible..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && searchBible(searchQuery)}
                />
                <Button
                  onClick={() => searchBible(searchQuery)}
                  className="w-full bg-liturgical-primary hover:bg-liturgical-secondary"
                  disabled={loading}
                >
                  {loading ? "Recherche..." : "Rechercher"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Sélection de livre */}
          <Card className="liturgical-card hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center text-liturgical-primary">
                <Book className="h-5 w-5 mr-2" />
                Livres de la Bible
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm text-liturgical-text mb-2">Ancien Testament</h4>
                  <div className="grid grid-cols-1 gap-1 max-h-40 overflow-y-auto">
                    {bibleBooks
                      .filter((book) => book.testament === "AT")
                      .map((book) => (
                        <Button
                          key={book.id}
                          variant={selectedBook?.id === book.id ? "default" : "ghost"}
                          size="sm"
                          onClick={() => {
                            setSelectedBook(book)
                            setSelectedChapter(1)
                          }}
                          className="justify-start text-xs hover-lift"
                        >
                          {book.name}
                        </Button>
                      ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-liturgical-text mb-2">Nouveau Testament</h4>
                  <div className="grid grid-cols-1 gap-1 max-h-40 overflow-y-auto">
                    {bibleBooks
                      .filter((book) => book.testament === "NT")
                      .map((book) => (
                        <Button
                          key={book.id}
                          variant={selectedBook?.id === book.id ? "default" : "ghost"}
                          size="sm"
                          onClick={() => {
                            setSelectedBook(book)
                            setSelectedChapter(1)
                          }}
                          className="justify-start text-xs hover-lift"
                        >
                          {book.name}
                        </Button>
                      ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Signets */}
          {bookmarks.length > 0 && (
            <Card className="liturgical-card hover-lift">
              <CardHeader>
                <CardTitle className="flex items-center text-liturgical-primary">
                  <Bookmark className="h-5 w-5 mr-2" />
                  Mes signets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {bookmarks.map((bookmark, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-liturgical-bg rounded">
                      <span className="text-sm text-liturgical-text">{bookmark}</span>
                      <Button variant="ghost" size="icon" onClick={() => toggleBookmark(bookmark)} className="h-6 w-6">
                        <Star className={`h-3 w-3 fill-current text-liturgical-primary`} />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Contenu principal */}
        <div className="lg:col-span-2 space-y-4 animate-slide-in-right">
          {/* Résultats de recherche */}
          {searchResults.length > 0 && (
            <Card className="liturgical-card hover-lift">
              <CardHeader>
                <CardTitle className="text-liturgical-primary">Résultats de recherche</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {searchResults.map((result, index) => (
                    <div key={index} className="p-4 bg-liturgical-bg rounded-lg border-l-4 border-liturgical-primary">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary" className="bg-liturgical-primary/20 text-liturgical-primary">
                          {result.book} {result.chapter}:{result.verse}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleBookmark(`${result.book} ${result.chapter}:${result.verse}`)}
                          className="h-6 w-6"
                        >
                          <Star
                            className={`h-3 w-3 ${bookmarks.includes(`${result.book} ${result.chapter}:${result.verse}`) ? "fill-current text-liturgical-primary" : ""}`}
                          />
                        </Button>
                      </div>
                      <p className="text-sm leading-relaxed">{result.text}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lecteur de chapitre + barre de navigation lectures */}
          {selectedBook && (
            <>
              {/* Barre de navigation lectures - scroll horizontal */}
              <div className="flex overflow-x-auto no-scrollbar gap-4 mb-6 px-2" style={{ WebkitOverflowScrolling: 'touch' }}>
                {["lecture_1", "psaume", "lecture_2", "evangile"].map((type, idx) => {
                  // Lecture active = nette, autres = floues
                  // Pour la démo, lecture_1 est active
                  const isActive = idx === 0;
                  return (
                    <button
                      key={type}
                      className={`min-w-[140px] px-4 py-2 rounded-full font-semibold transition-all duration-200 focus:outline-none ${isActive ? "bg-liturgical-primary text-white shadow-lg" : "bg-liturgical-primary/10 text-liturgical-primary opacity-60 blur-sm"}`}
                      style={{ filter: isActive ? "none" : "blur(2px)", opacity: isActive ? 1 : 0.6 }}
                      onClick={() => {
                        const el = document.getElementById(type);
                        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                      }}
                    >
                      {type === "lecture_1" && "Première lecture"}
                      {type === "psaume" && "Psaume"}
                      {type === "lecture_2" && "Deuxième lecture"}
                      {type === "evangile" && "Évangile"}
                    </button>
                  );
                })}
              </div>
              {/* Slider horizontal des lectures avec ReadingCard et données réelles du jour */}
              <div className="w-full overflow-x-auto no-scrollbar pb-4">
                <div className="flex flex-row gap-6 min-w-[600px] px-2">
                  {(() => {
                    // Extraire les lectures du jour depuis les données réelles (exemple)
                    // Remplace lecturesData par ta source réelle (API, JSON, etc.)
                    const lecturesData = [
                      // lecture_1
                      chapterVerses.find((v: any) => v.type === "lecture_1"),
                      // psaume
                      chapterVerses.find((v: any) => v.type === "psaume"),
                      // lecture_2
                      chapterVerses.find((v: any) => v.type === "lecture_2"),
                      // evangile
                      chapterVerses.find((v: any) => v.type === "evangile"),
                    ].filter(Boolean);
                    return lecturesData.map((lecture, idx) => (
                      <div key={lecture.type || idx} className="flex-shrink-0 w-[340px]">
                        <ReadingCard reading={lecture} type={lecture.type as any} className={idx === 0 ? "" : "opacity-60 blur-sm"} />
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </>
          )}

          {/* Message d'accueil */}
          {!selectedBook && searchResults.length === 0 && (
            <Card className="liturgical-card hover-lift">
              <CardContent className="p-8 text-center">
                <Book className="h-16 w-16 text-liturgical-primary mx-auto mb-4 animate-float" />
                <h3 className="text-xl font-semibold text-liturgical-primary mb-2">Bienvenue dans la Bible</h3>
                <p className="text-muted-foreground mb-4">
                  Choisissez un livre dans le panneau de gauche ou utilisez la recherche pour explorer la Parole de
                  Dieu.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge variant="secondary" className="bg-liturgical-primary/20 text-liturgical-primary">
                    73 livres
                  </Badge>
                  <Badge variant="secondary" className="bg-liturgical-primary/20 text-liturgical-primary">
                    1189 chapitres
                  </Badge>
                  <Badge variant="secondary" className="bg-liturgical-primary/20 text-liturgical-primary">
                    31 102 versets
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
