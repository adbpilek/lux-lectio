// Script Node.js pour scraper les informations du saint du jour depuis catholic.org
// Utilise node-fetch et cheerio

let fetchFn;
async function fetchCompat(...args) {
  if (!fetchFn) {
    try {
      // node-fetch v3+ (ESM)
      fetchFn = (await import('node-fetch')).default;
    } catch (e) {
      // fallback to global fetch (Node 18+)
      if (typeof fetch !== 'undefined') fetchFn = fetch;
      else throw e;
    }
  }
  return fetchFn(...args);
}
const cheerio = require('cheerio');

async function getSaintOfTheDay() {
  const url = 'https://www.catholic.org/saints/sofd.php';
  const res = await fetchCompat(url);
  const html = await res.text();
  const $ = cheerio.load(html);

  // Nouvelle structure : section #saintsSofd
  const $sofd = $('#saintsSofd');
  let name = null, image = null, description = '', detailUrl = null;
  if ($sofd.length) {
    // Nom du saint (dans le premier h3 > a)
    const saintLink = $sofd.find('h3 a').first();
    name = saintLink.text().trim();
    detailUrl = saintLink.attr('href');
    if (detailUrl && !detailUrl.startsWith('http')) detailUrl = `https://www.catholic.org${detailUrl}`;
    // Image (dans le premier <a> avec <img>)
    const img = $sofd.find('a img').first().attr('data-src') || $sofd.find('a img').first().attr('src');
    if (img && !img.startsWith('data:')) image = img.startsWith('http') ? img : `https://www.catholic.org${img}`;
    // Description complète : aller chercher tout le texte de la fiche détail si possible
    const h3 = $sofd.find('h3').first();
    if (h3.length && detailUrl) {
      try {
        const detailRes = await fetchCompat(detailUrl);
        const detailHtml = await detailRes.text();
        const $detail = cheerio.load(detailHtml);
        // Chercher tous les paragraphes pertinents de la fiche (hors copyright/pub)
        let fullBio = '';
        let mainContainer = $detail('.saint_bio');
        if (!mainContainer.length) mainContainer = $detail('.content');
        if (!mainContainer.length) mainContainer = $detail('.row');
        if (!mainContainer.length) mainContainer = $detail('body');
        if (mainContainer.length) {
          // Récupérer tous les <p> narratifs (longs, sans navigation/pub, et qui contiennent le nom du saint ou qui suivent le premier vrai paragraphe)
          const allParas = mainContainer.find('p').map((i, el) => $detail(el).text().replace(/\s+/g, ' ').trim()).get();
            // Prendre tous les paragraphes longs (>80 caractères) de la page détail, hors mentions légales/pub
            const bioParas = allParas.filter(txt => txt && txt.length > 80 && !/copyright|advertisement|navigation|donate|search|shop|subscribe|saints & angels|prayer of the day|bible|rosary|news desk|school|pdf|gallery|light a prayer|virtual|trending|feastday|author|publisher|printable|script|googletag|continue reading|more saints|find saints|fun facts|faqs|videos|updates|missions|angels|church doctors/i.test(txt));
            if (bioParas.length) fullBio = bioParas.join('\n\n');
        }
        if (fullBio.length > 40) description = fullBio;
      } catch (e) {
        // fallback : texte du parent comme avant
        const parent = h3.parent();
        let raw = parent.text();
        if (name) raw = raw.replace(name, '');
        description = raw.trim().replace(/^\s*\n/gm, '');
      }
    } else if (h3.length) {
      // fallback : texte du parent comme avant
      const parent = h3.parent();
      let raw = parent.text();
      if (name) raw = raw.replace(name, '');
      description = raw.trim().replace(/^\s*\n/gm, '');
    }
  }
  // Fallbacks si la structure change
  if (!name) name = $('h3 a').first().text().trim();
  if (!image) {
    const img = $('img').first().attr('data-src') || $('img').first().attr('src');
    if (img && !img.startsWith('data:')) image = img.startsWith('http') ? img : `https://www.catholic.org${img}`;
  }
  if (!detailUrl) {
    const link = $('h3 a').first().attr('href');
    if (link) detailUrl = link.startsWith('http') ? link : `https://www.catholic.org${link}`;
  }
  if (!description) description = $('p').first().text().trim();

  // Détecter si la description est en anglais (simple heuristique)
  function isEnglish(text) {
    // Si beaucoup de mots anglais courants, on considère que c'est de l'anglais
    return /\b(the|and|was|who|after|years|saint|bishop|present|where|himself|wisdom|sanctity|defenders|faith|heresy|council)\b/i.test(text);
  }

  let descriptionFr = description;
  if (description && isEnglish(description)) {
    // Appel synchrone au script Python local pour la traduction
    const { execSync } = require('child_process');
    try {
      const output = execSync(`python3 scripts/translate_local.py ${JSON.stringify(description)}`, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] });
      if (output && output.trim()) descriptionFr = output.trim();
    } catch (e) {
      // Si erreur, on garde la version originale
      descriptionFr = description;
    }
  }
  return {
    name,
    image,
    description: descriptionFr,
    detailUrl,
  };
}

// Pour test local
if (require.main === module) {
  getSaintOfTheDay().then(console.log).catch(console.error);
}

module.exports = { getSaintOfTheDay };
