// Traduction du texte anglais en français avec l’API LibreTranslate (open-source, gratuite)
// npm install node-fetch@2
const fetch = require('node-fetch');

async function translateToFrench(text) {
  const url = 'https://libretranslate.com/translate';
  // Utilise l'API Google Cloud Translation (clé requise dans GOOGLE_TRANSLATE_API_KEY)
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!apiKey) throw new Error('Veuillez définir la variable d\'environnement GOOGLE_TRANSLATE_API_KEY');
  const googleUrl = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
  const res = await fetch(googleUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      q: text,
      source: 'en',
      target: 'fr',
      format: 'text'
    })
  });
  if (!res.ok) throw new Error('Erreur Google Translate');
  const data = await res.json();
  if (data && data.data && data.data.translations && data.data.translations[0] && data.data.translations[0].translatedText) {
    return data.data.translations[0].translatedText;
  }
  throw new Error('Traduction non trouvée');
}

if (require.main === module) {
  const txt = process.argv.slice(2).join(' ') || 'The holy confessor Paphnutius was an Egyptian who, after having spent several years in the desert under the direction of the great St. Antony, was made bishop in the Upper Thebaid.';
  translateToFrench(txt).then(console.log).catch(console.error);
}

module.exports = translateToFrench;
