"""scikit-learn version of the bullet-strength trainer.

    python -m pip install scikit-learn
    python scripts/resume/train_sklearn.py

Reads scripts/resume/examples.txt and writes src/data/bulletModel.json in the same format as train.mjs.
The feature list must match FEATURES in train.mjs and bulletFeatures() in src/lib/resumeEngine.ts.
Not run on the owner's PC, where Windows Application Control blocks scipy; run it elsewhere.
"""
import json
import re
from pathlib import Path

import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold, cross_val_score

here = Path(__file__).parent
FEATURES = ["bias", "hasNumber", "hasPercentOrMoney", "startsWithVerb", "weakPhrase", "lengthOk", "tooShort", "firstPerson", "hasResultWord"]
VERBS = set("built reduced increased led designed resolved automated trained diagnosed managed wrote analysed analyzed improved coordinated launched cut presented mentored implemented tested negotiated supported migrated organised organized streamlined developed created delivered saved grew raised fixed optimised optimized introduced rebuilt secured identified halved".split())
WEAK = re.compile(r"(responsible for|duties|helped with|helped out|worked on|in charge|assisted|team player|hard working|various|general|involved in|tasked|took care|dealt with|part of)", re.I)


def features(text):
    t = text.strip()
    words = t.split()
    first = re.sub(r"[^a-z]", "", (words[0] if words else "").lower())
    return [
        1,
        1 if re.search(r"\d", t) else 0,
        1 if re.search(r"(\d\s?%|\$\s?\d|\d\s?(k|m)\b)", t, re.I) else 0,
        1 if first in VERBS else 0,
        1 if WEAK.search(t) else 0,
        1 if 8 <= len(words) <= 28 else 0,
        1 if len(words) < 6 else 0,
        1 if re.search(r"\b(i|my|me)\b", t, re.I) else 0,
        1 if re.search(r"(reduc|increas|improv|cut|sav|grew|rais|halv|fill|recover|secur|deliver)", t, re.I) else 0,
    ]


X, y = [], []
for line in (here / "examples.txt").read_text(encoding="utf-8").splitlines():
    if line.strip() and not line.startswith("#"):
        label, text = line.split("|", 1)
        X.append(features(text))
        y.append(1 if label.strip() == "strong" else 0)
X, y = np.array(X), np.array(y)

clf = LogisticRegression(C=10, fit_intercept=False, max_iter=2000)
acc = cross_val_score(clf, X, y, cv=StratifiedKFold(5, shuffle=True, random_state=0)).mean()
clf.fit(X, y)
model = {"features": FEATURES, "weights": [round(float(w), 4) for w in clf.coef_[0]], "examples": int(len(y)), "cvAccuracy": round(float(acc), 3), "trainer": "train_sklearn.py"}
(here.parent.parent / "src/data/bulletModel.json").write_text(json.dumps(model, indent=2) + "\n", encoding="utf-8")
print(model)
