"""scikit-learn version of the intent trainer.

    python -m pip install scikit-learn
    python scripts/intent/train_sklearn.py

Reads scripts/intent/examples.txt and writes src/data/intentModel.json in the same format as
train.mjs, so either trainer can produce the model the website loads. Not run on the owner's PC,
where Windows Application Control blocks scipy; run it on any machine (or a CI job) that allows it.
"""
import json
import re
from pathlib import Path

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.pipeline import make_pipeline

here = Path(__file__).parent
rows = []
for line in (here / "examples.txt").read_text(encoding="utf-8").splitlines():
    if line.strip() and not line.startswith("#"):
        label, text = line.split("|", 1)
        rows.append((label.strip(), text.strip()))
labels = [r[0] for r in rows]
texts = [r[1] for r in rows]

# Same tokens as train.mjs and src/lib/intent.ts: lowercase words of 2+ letters or digits, plus bigrams.
vectorizer = TfidfVectorizer(lowercase=True, token_pattern=r"[a-z0-9]{2,}", ngram_range=(1, 2), norm="l2")
classifier = LogisticRegression(C=3, max_iter=2000)

pipeline = make_pipeline(vectorizer, classifier)
scores = cross_val_score(pipeline, texts, labels, cv=StratifiedKFold(5, shuffle=True, random_state=7))
print(f"{len(rows)} examples, 5-fold cross-validated accuracy: {scores.mean():.1%}")

pipeline.fit(texts, labels)
vocab = [t for t, _ in sorted(vectorizer.vocabulary_.items(), key=lambda kv: kv[1])]
model = {
    "version": 1,
    "trainedOn": len(rows),
    "cvAccuracy": round(float(scores.mean()), 3),
    "classes": list(classifier.classes_),
    "vocab": vocab,
    "idf": [round(float(v), 3) for v in vectorizer.idf_],
    "coef": [[round(float(v), 3) for v in row] for row in classifier.coef_],
    "intercept": [round(float(v), 3) for v in classifier.intercept_],
}
dest = here.parent.parent / "src" / "data" / "intentModel.json"
dest.write_text(json.dumps(model), encoding="utf-8")
print("wrote", dest)
