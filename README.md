# Briefing Generator

**English** · [Deutsch](#deutsch)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A free, static briefing generator with 12 templates for content, sales, email, website relaunches and AI video. You pick a template, fill in what you already know, and export the brief as a fillable PDF, as Markdown, or print it. Empty fields stay input fields in the PDF, so the brief doubles as a questionnaire your agency or writer can complete on screen.

Live: [litzki-systems.com/tools/how-to-write-a-brief](https://litzki-systems.com/tools/how-to-write-a-brief/#generator) (English) · [litzki-systems.com/de/werkzeuge/briefing-aufbau-erstellen](https://litzki-systems.com/de/werkzeuge/briefing-aufbau-erstellen/#generator) (German)

## What it does

- **12 templates in 5 groups:** content brief (blog post), corporate blog / white paper, guest post / sponsored article, trade article / advertorial, sales page, B2B solution page, product description, email sales sequence, email automation, B2B cold outreach, website relaunch, AI video script.
- **Built-in blocks** for AI search and AI Overviews (direct answer, citable facts, entities, question coverage, E-E-A-T) and for logistics (deadline, sign-off, re-briefing).
- **Exports:** fillable PDF (filled-in answers fixed in the document, empty fields as PDF form fields), copy to clipboard, `.md` download, print with page numbers.
- **German and English.** The language follows `<html lang>`; templates live in two JSON files with identical IDs.

## Privacy by design

Everything runs in the browser. No server, no API, no AI call, no cookies, no `localStorage`, no tracking. Input is lost when you reload the page (the page warns you first). The PDF library is loaded only when you click "Fillable PDF".

## Measured, not estimated

The generator invents nothing: no estimated scores, no simulated numbers, no generated text. It only structures what you enter.

## Run it

The page loads its templates with `fetch`, so it needs a local web server (opening the file directly with `file://` does not work):

```bash
python3 -m http.server 8000
# English: http://localhost:8000/
# German:  http://localhost:8000/index.de.html
```

Any static host works (GitHub Pages, Netlify, Apache, Cloudflare Pages). There is no build step.

## Embed it in your own page

1. Copy `js/`, `assets/` and the `bg-*` rules from `css/briefing-generator.css`.
2. Add the markup from `index.html` (the `#briefing-generator` container and its buttons) to your page.
3. Load `js/briefing-generator.js`.

Optional attributes on `#briefing-generator`:

| Attribute | Purpose | Default |
| --- | --- | --- |
| `data-lang` | `de` or `en` | value of `<html lang>` |
| `data-base` | base path for `js/` and `assets/` | `/` |
| `data-src` | URL of the template JSON | `assets/data/briefing-vorlagen.json` (de) or `assets/data/briefing-templates.en.json` (en) |
| `data-url` | address shown in the print and PDF footer | the guide on litzki-systems.com |

A link like `#template=sales-page` (or `#vorlage=sales-page`) opens a specific template.

## Templates

Each template has `abschnitte` (sections) with `felder` (fields). Each field has a `label`, a `frage` (the question to answer) and an optional `beispiel` (example). Sections can reference shared blocks via `"ref"`. Keys are German in both files; add a template by adding it to both JSON files with the same `id`.

## Files

```
index.html                         English page
index.de.html                      German page
css/briefing-generator.css         styles (screen and print)
js/briefing-generator.js           generator
js/briefing-pdf.js                 fillable PDF, loaded on demand
js/vendor/                         pdf-lib 1.17.1, fontkit 1.1.1 (MIT)
assets/data/                       templates DE and EN
assets/fonts/pdf/                  Inter, EB Garamond (SIL OFL 1.1)
.github/social-preview.png         social sharing image (1280 × 640)
```

## License

MIT, see [LICENSE](LICENSE). Third-party components and their licenses: [NOTICE.md](NOTICE.md).

## Author

Thorsten Litzki · [Litzki Systems](https://litzki-systems.com)

---

<a id="deutsch"></a>

# Briefing-Generator

[English](#briefing-generator) · **Deutsch**

[![Lizenz: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Ein kostenloser, statischer Briefing-Generator mit 12 Vorlagen für Content, Verkauf, E-Mail, Website-Relaunch und KI-Video. Sie wählen eine Vorlage, füllen aus, was Sie schon wissen, und exportieren das Briefing als ausfüllbares PDF, als Markdown oder drucken es. Leere Felder bleiben im PDF Eingabefelder: So wird das Briefing zum Fragebogen, den Agentur oder Texter am Bildschirm ergänzen.

Live: [litzki-systems.com/de/werkzeuge/briefing-aufbau-erstellen](https://litzki-systems.com/de/werkzeuge/briefing-aufbau-erstellen/#generator) (Deutsch) · [litzki-systems.com/tools/how-to-write-a-brief](https://litzki-systems.com/tools/how-to-write-a-brief/#generator) (Englisch)

## Was er kann

- **12 Vorlagen in 5 Gruppen:** Content-Briefing (Blogartikel), Corporate Blog / Whitepaper, Gastbeitrag / bezahlter Artikel, Fachartikel / Advertorial, Sales Page, B2B Solution Page, Produktbeschreibung, E-Mail-Verkaufssequenz, E-Mail-Automation, B2B-Kaltakquise, Website-Relaunch, KI-Video-Skript.
- **Bausteine** für KI-Suche und AI Overviews (direkte Antwort, zitierfähige Fakten, Entitäten, Fragen-Abdeckung, E-E-A-T) und für Organisatorisches (Deadline, Freigabe, Rebriefing).
- **Exporte:** ausfüllbares PDF (ausgefüllte Antworten fest im Dokument, leere Felder als PDF-Formularfelder), Kopieren, `.md`-Download, Drucken mit Seitenzahlen.
- **Deutsch und Englisch.** Die Sprache folgt `<html lang>`, die Vorlagen liegen in zwei JSON-Dateien mit identischen IDs.

## Datenschutz von Grund auf

Alles läuft im Browser. Kein Server, keine API, kein KI-Aufruf, keine Cookies, kein `localStorage`, kein Tracking. Beim Neuladen gehen die Eingaben verloren (die Seite warnt vorher). Die PDF-Bibliothek wird erst beim Klick auf „Ausfüllbares PDF“ geladen.

## Gemessen statt geschätzt

Der Generator erfindet nichts: keine geschätzten Scores, keine simulierten Zahlen, keine generierten Texte. Er strukturiert nur, was Sie eingeben.

## Starten

Die Seite lädt die Vorlagen per `fetch` und braucht deshalb einen lokalen Webserver (direktes Öffnen per `file://` funktioniert nicht):

```bash
python3 -m http.server 8000
# Deutsch:  http://localhost:8000/index.de.html
# Englisch: http://localhost:8000/
```

Jeder statische Host funktioniert (GitHub Pages, Netlify, Apache, Cloudflare Pages). Es gibt keinen Build-Schritt.

## In eine eigene Seite einbauen

1. `js/`, `assets/` und die `bg-*`-Regeln aus `css/briefing-generator.css` übernehmen.
2. Das Markup aus `index.de.html` (Container `#briefing-generator` mit den Buttons) in die Seite einfügen.
3. `js/briefing-generator.js` laden.

Optionale Attribute am Container: `data-lang` (`de`/`en`), `data-base` (Basispfad für `js/` und `assets/`), `data-src` (URL der Vorlagen-JSON), `data-url` (Adresse im Fußtext von Druck und PDF). Details in der Tabelle im englischen Teil.

Ein Link wie `#vorlage=sales-page` öffnet direkt eine bestimmte Vorlage.

## Vorlagen

Jede Vorlage hat `abschnitte` mit `felder`. Jedes Feld hat `label`, `frage` (was ausgefüllt wird) und optional `beispiel`. Abschnitte können gemeinsame Bausteine per `"ref"` einbinden. Eine neue Vorlage tragen Sie in beide JSON-Dateien mit derselben `id` ein.

## Lizenz

MIT, siehe [LICENSE](LICENSE). Fremdkomponenten und ihre Lizenzen: [NOTICE.md](NOTICE.md).

## Autor

Thorsten Litzki · [Litzki Systems](https://litzki-systems.com)
