// Scraper pour le saint du jour sur Aleteia.org (français)
// npm install node-fetch@2 cheerio
const fetch = require('node-fetch');
const cheerio = require('cheerio');

async function getSaintOfTheDayAleteia() {
  const url = 'https://fr.aleteia.org/category/vie-chretienne/saint-du-jour/';
  const res = await fetch(url);
  const html = await res.text();
  const $ = cheerio.load(html);

  // Trouver le premier article du jour
  const article = $('article').first();
  let name = '', image = '', bio = '', citation = '';

  // Titre
  name = article.find('h2, h1').first().text().trim();

  // Lien vers la page détail
  const detailUrl = article.find('a').first().attr('href');
  if (detailUrl) {
    const detailRes = await fetch(detailUrl);
    const detailHtml = await detailRes.text();
    const $detail = cheerio.load(detailHtml);
    // Image principale
    image = $detail('figure img').first().attr('src') || '';
    // Bio : concaténer les 2-3 premiers <p> significatifs
    let bioParas = [];
    $detail('div.article-content p').each((i, el) => {
      if (bioParas.length >= 3) return false;
      const txt = $detail(el).text().replace(/\s+/g, ' ').trim();
      if (txt && txt.length > 40) bioParas.push(txt);
    });
    bio = bioParas.join('\n\n');
    // Citation : première <blockquote> ou <em>
    citation = $detail('blockquote').first().text().trim();
    if (!citation) citation = $detail('em').first().text().trim();
  }

  return { name, image, bio, citation };
}

if (require.main === module) {
  getSaintOfTheDayAleteia().then(data => console.log(data)).catch(console.error);
}
