# Traduction locale anglais -> français avec MarianMT (HuggingFace Transformers)
# Nécessite Python 3.8+, pip install torch transformers

from transformers import MarianMTModel, MarianTokenizer
import sys

def translate(text, src_lang='en', tgt_lang='fr'):
    model_name = f'Helsinki-NLP/opus-mt-{src_lang}-{tgt_lang}'
    tokenizer = MarianTokenizer.from_pretrained(model_name)
    model = MarianMTModel.from_pretrained(model_name)
    batch = tokenizer([text], return_tensors="pt", padding=True)
    gen = model.generate(**batch)
    translated = tokenizer.batch_decode(gen, skip_special_tokens=True)
    return translated[0]

if __name__ == "__main__":
    txt = ' '.join(sys.argv[1:]) or "The holy confessor Paphnutius was an Egyptian who, after having spent several years in the desert under the direction of the great St. Antony, was made bishop in the Upper Thebaid. He was one of the most zealous defenders of the faith against the Arian heresy, and was present at the Council of Nicaea, where he distinguished himself by his wisdom and sanctity."
    print(translate(txt))
