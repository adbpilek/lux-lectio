const fs = require('fs');
const path = require('path');

const biblePath = path.join(__dirname, '../public/bibleCathliqueCrampon');

// Fonction pour remplacer Yahweh dans le texte
function replaceYahweh(text) {
    // Remplacer "le Seigneur Yahweh" par "le Seigneur Dieu"
    text = text.replace(/le Seigneur Yahweh/gi, "le Seigneur Dieu");
    text = text.replace(/Seigneur Yahweh/gi, "Seigneur Dieu");
    
    // Remplacer les autres occurrences de Yahweh par "le Seigneur"
    text = text.replace(/Yahweh/g, "le Seigneur");
    text = text.replace(/YAHWEH/g, "le Seigneur");
    
    return text;
}

// Lire et traiter chaque fichier
fs.readdirSync(biblePath).forEach(file => {
    if (!file.endsWith('.json')) return;
    
    const filePath = path.join(biblePath, file);
    console.log(`Processing ${file}...`);
    
    try {
        // Lire le fichier
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);
        
        // Parcourir et modifier chaque verset
        data.chapters.forEach(chapter => {
            chapter.verses.forEach(verse => {
                verse.text = replaceYahweh(verse.text);
            });
        });
        
        // Écrire le fichier modifié
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log(`Finished processing ${file}`);
    } catch (error) {
        console.error(`Error processing ${file}:`, error);
    }
});
