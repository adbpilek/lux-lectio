// Script Node.js pour scraper le saint du jour depuis Nominis (https://nominis.cef.fr)
// Récupère nom, biographie, image, etc.
// Utilise node-fetch et cheerio

let fetchFn;
async function fetchCompat(...args) {
  if (!fetchFn) {
    try {
      fetchFn = (await import('node-fetch')).default;
    } catch (e) {
      if (typeof fetch !== 'undefined') fetchFn = fetch;
      else throw e;
    }
  }
  return fetchFn(...args);
}
const cheerio = require('cheerio');

async function getSaintOfTheDayNominis() {
  const url = 'https://nominis.cef.fr/';
  const res = await fetchCompat(url);
  const html = await res.text();
  const $ = cheerio.load(html);

  // Nom du saint (dans le premier h2 > a)
  const saintA = $('h2 a').first();
  const name = saintA.text().trim();
  let detailUrl = saintA.attr('href');
  if (detailUrl && !detailUrl.startsWith('http')) detailUrl = 'https://nominis.cef.fr' + detailUrl;

  // Description (dans le <p> qui suit le h2)
  let bio = '';
  const h2 = saintA.closest('h2');
  if (h2.length) {
    const p = h2.nextAll('p').first();
    bio = p.text().trim();
  }

  // Image (dans le <img> du <p> ou juste après le h2)
  let image = null;
  if (h2.length) {
    const img = h2.nextAll('p').find('img').first().attr('src');
    if (img && !img.startsWith('data:')) image = img.startsWith('http') ? img : 'https://nominis.cef.fr' + img;
  }
  if (!image) {
    const img = $('img').first().attr('src');
    if (img && !img.startsWith('data:')) image = img.startsWith('http') ? img : 'https://nominis.cef.fr' + img;
  }

  // Fête (dans le h3 qui suit le h2)
  let fete = '';
  if (h2.length) {
    const h3 = h2.nextAll('h3').first();
    fete = h3.text().trim();
  }

  // Citation (dans le <em> du <p> ou dans le texte)
  let citation = '';
  if (h2.length) {
    const em = h2.nextAll('p').find('em').first();
    citation = em.text().trim();
  }

  // Patronages (non disponible sur la home, laisser vide)
  let patronage = '';

  // Si on a un lien de détail, aller chercher la vraie fiche pour enrichir les infos
  if (detailUrl) {
    try {
      const detailRes = await fetchCompat(detailUrl);
      const detailHtml = await detailRes.text();
      const $detail = cheerio.load(detailHtml);
      // Section principale : .card.mb-2
      const card = $detail('.card.mb-2').first();
      // Nom (h1)
      const nameDetail = card.find('h1').first().text().trim();
      if (nameDetail) name = nameDetail;
      // Fête (h2)
      const feteDetail = card.find('h2').first().text().trim();
      if (feteDetail) fete = feteDetail;
      // card-body contient du HTML complet (DOCTYPE, html, body)
      const cardBodyHtml = card.find('.card-body').html();
      if (cardBodyHtml) {
        // Chercher le sous-HTML complet (DOCTYPE, html, body)
        const match = cardBodyHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        let innerHtml = match ? match[1] : cardBodyHtml;
        const $body = cheerio.load(innerHtml);
        // Image principale : src contient /gallerie/
        let imgDetail = null;
        let bioDetail = '';
        let citationDetail = '';
        $body('img').each((i, el) => {
          const src = $body(el).attr('src');
          if (src && src.includes('/gallerie/')) {
            imgDetail = src.startsWith('http') ? src : 'https://nominis.cef.fr' + src;
            // Essayer d'abord autour de l'image
            let bioParas = [];
            let found = false;
            let next = $body(el).parent();
            if (next.is('p')) {
              found = true;
            } else {
              next = $body(el).nextAll('p').first();
              if (next.length) found = true;
            }
            if (found) {
              let count = 0;
              let p = next;
              while (p.length && count < 3) {
                const txt = p.text().replace(/\s+/g, ' ').trim();
                if (txt && txt.length > 40 && !txt.toLowerCase().includes('copyright') && !txt.toLowerCase().includes('source')) {
                  bioParas.push(txt);
                  count++;
                }
                p = p.nextAll('p').first();
              }
            }
            if (bioParas.length) bioDetail = bioParas.join('\n\n');
            // Citations proches de l'image
            let ems = [];
            let blockquotes = [];
            let nextEl = $body(el).next();
            let emCount = 0, bqCount = 0;
            while (nextEl.length && (emCount < 2 || bqCount < 2)) {
              if (nextEl.is('em') && emCount < 2) { ems.push(nextEl.text().trim()); emCount++; }
              if (nextEl.is('blockquote') && bqCount < 2) { blockquotes.push(nextEl.text().trim()); bqCount++; }
              nextEl = nextEl.next();
            }
            if (ems.length) citationDetail = ems.join(' ');
            if (blockquotes.length && !citationDetail) citationDetail = blockquotes.join(' ');
            return false;
          }
        });
        if (imgDetail) image = imgDetail;
        // Extraction exhaustive : tout texte significatif (p, div, span, li)
        if ((!bioDetail || bioDetail.length < 40)) {
          let bioBlocks = [];
          const tags = ['p', 'div', 'span', 'li'];
          tags.forEach(tag => {
            $body(tag).each((i, el) => {
              if (bioBlocks.length >= 4) return false;
              const txt = $body(el).text().replace(/\s+/g, ' ').trim();
              if (txt && txt.length > 40 && !txt.toLowerCase().includes('copyright') && !txt.toLowerCase().includes('source') && !txt.toLowerCase().includes('navigation')) {
                bioBlocks.push(txt);
              }
            });
          });
          // Nettoyer doublons
          bioBlocks = [...new Set(bioBlocks)];
          if (bioBlocks.length) bioDetail = bioBlocks.slice(0,3).join('\n\n');
        }
        // Citations : <em>, <blockquote>, <i>, <strong>
        if (!citationDetail) {
          let cits = [];
          const citTags = ['em', 'blockquote', 'i', 'strong'];
          citTags.forEach(tag => {
            $body(tag).each((i, el) => {
              if (cits.length < 2) cits.push($body(el).text().trim());
            });
          });
          cits = cits.filter(txt => txt && txt.length > 10);
          if (cits.length) citationDetail = cits.join(' ');
        }
        if (bioDetail && bioDetail.length > 40) bio = bioDetail;
        if (citationDetail) citation = citationDetail;
      }
      // Patronage (non présent, laisser vide)
    } catch (e) {
      // ignore erreur détail
    }
  }
  return {
    name,
    image,
    bio,
    fete,
    citation,
    patronage
  };
}

if (require.main === module) {
  getSaintOfTheDayNominis().then(console.log).catch(console.error);
}

module.exports = { getSaintOfTheDayNominis };
