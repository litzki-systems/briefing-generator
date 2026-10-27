/*
 * Briefing-Generator · litzki-systems.com
 * Statisch, ohne externe Abhängigkeiten. Alle Eingaben bleiben im Browser:
 * kein Server, kein Speicher, keine Cookies.
 * Daten: /assets/data/briefing-vorlagen.json (DE), /assets/data/briefing-templates.en.json (EN)
 * Sprache: <html lang> bzw. data-lang am Container. Optional am Container:
 * data-src (Daten-URL), data-url (Adresse im Fußtext von Druck und PDF),
 * data-base (Basispfad für js/ und assets/, Standard „/“).
 * Lizenz: MIT
 */
(function () {
  'use strict';

  var root = document.getElementById('briefing-generator');
  if (!root) return;

  var LANG = ((root.dataset.lang || document.documentElement.lang || 'de').slice(0, 2).toLowerCase() === 'en') ? 'en' : 'de';
  var T = {
    de: {
      data: '/assets/data/briefing-vorlagen.json',
      url: 'litzki-systems.com/de/werkzeuge/briefing-aufbau-erstellen',
      titleLabel: 'Titel des Briefings',
      examplePrefix: 'z. B. ',
      status: function (f, t) { return f + ' von ' + t + ' Feldern ausgefüllt'; },
      progress: function (f, t) { return f + ' von ' + t + ' Feldern'; },
      createdOn: function (d, url) { return '_Erstellt am ' + d + ' mit dem Briefing-Generator von ' + url.split('/')[0] + '_'; },
      copied: 'Briefing in die Zwischenablage kopiert.',
      copyFailed: 'Kopieren nicht möglich. Bitte nutzen Sie den Download.',
      saved: 'Briefing als Markdown-Datei gespeichert.',
      tool: 'Briefing-Generator',
      created: 'Erstellt', filled: 'Ausgefüllt', approval: 'Freigabe',
      footer1: function (url) { return 'Erstellt mit dem kostenlosen Briefing-Generator: ' + url; },
      footer2: 'Alle Eingaben wurden nur im Browser verarbeitet.',
      pdfBusy: 'PDF wird erstellt …',
      pdfDone: 'Ausfüllbares PDF gespeichert. Leere Felder lassen sich darin direkt ausfüllen.',
      pdfFailed: 'Das PDF konnte nicht erstellt werden. Bitte nutzen Sie „Drucken“.',
      resetConfirm: 'Alle Eingaben in dieser Vorlage löschen?',
      resetDone: 'Vorlage zurückgesetzt.',
      loadFailed: 'Die Vorlagen konnten nicht geladen werden. Bitte laden Sie die Seite neu.',
      date: function (d) { return ('0' + d.getDate()).slice(-2) + '.' + ('0' + (d.getMonth() + 1)).slice(-2) + '.' + d.getFullYear(); }
    },
    en: {
      data: '/assets/data/briefing-templates.en.json',
      url: 'litzki-systems.com/tools/how-to-write-a-brief',
      titleLabel: 'Brief title',
      examplePrefix: 'e.g. ',
      status: function (f, t) { return f + ' of ' + t + ' fields filled in'; },
      progress: function (f, t) { return f + ' of ' + t + ' fields'; },
      createdOn: function (d, url) { return '_Created on ' + d + ' with the Briefing Generator by ' + url.split('/')[0] + '_'; },
      copied: 'Brief copied to the clipboard.',
      copyFailed: 'Copying is not possible here. Please use the download instead.',
      saved: 'Brief saved as a Markdown file.',
      tool: 'Briefing Generator',
      created: 'Created', filled: 'Filled in', approval: 'Sign-off',
      footer1: function (url) { return 'Created with the free Briefing Generator: ' + url; },
      footer2: 'All input was processed in the browser only.',
      pdfBusy: 'Creating PDF …',
      pdfDone: 'Fillable PDF saved. Empty fields can be filled in directly in the PDF.',
      pdfFailed: 'The PDF could not be created. Please use “Print” instead.',
      resetConfirm: 'Delete all input in this template?',
      resetDone: 'Template reset.',
      loadFailed: 'The templates could not be loaded. Please reload the page.',
      date: function (d) {
        var m = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return m[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
      }
    }
  }[LANG];
  var BASE = root.dataset.base || '/';
  var DATA_URL = root.dataset.src || (BASE + T.data.slice(1));
  var SITE_URL = root.dataset.url || T.url;

  var data = null;
  var current = null;      // aktuelle Vorlage
  var values = {};         // { vorlageId: { feldKey: wert, __titel: wert } }

  // ---------- Hilfsfunktionen ----------
  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  function sections(vorlage) {
    return vorlage.abschnitte.map(function (a) {
      return a.ref ? data.bausteine[a.ref] : a;
    }).filter(Boolean);
  }

  function key(abschnitt, feld) { return abschnitt.id + '.' + feld.id; }

  function store() {
    if (!values[current.id]) values[current.id] = {};
    return values[current.id];
  }

  function today() {
    return T.date(new Date());
  }

  function slug(text) {
    return (text || 'briefing').toLowerCase()
      .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'briefing';
  }

  // ---------- Aufbau ----------
  function buildPicker() {
    var picker = root.querySelector('[data-bg="picker"]');
    picker.textContent = '';
    data.kategorien.forEach(function (kat) {
      var vorlagen = data.vorlagen.filter(function (v) { return v.kategorie === kat.id; });
      if (!vorlagen.length) return;
      var group = el('div', 'bg-picker__group');
      group.appendChild(el('p', 'bg-picker__label', kat.name));
      var row = el('div', 'bg-picker__row');
      vorlagen.forEach(function (v) {
        var btn = el('button', 'bg-chip', v.name);
        btn.type = 'button';
        btn.setAttribute('aria-pressed', 'false');
        btn.dataset.id = v.id;
        btn.addEventListener('click', function () { select(v.id, true); });
        row.appendChild(btn);
      });
      group.appendChild(row);
      picker.appendChild(group);
    });
  }

  function select(id, focus) {
    current = data.vorlagen.filter(function (v) { return v.id === id; })[0];
    if (!current) return;
    root.querySelectorAll('.bg-chip').forEach(function (b) {
      b.setAttribute('aria-pressed', b.dataset.id === id ? 'true' : 'false');
    });
    buildForm();
    if (focus) {
      var t = root.querySelector('#bg-titel');
      if (t) t.focus({ preventScroll: false });
    }
  }

  function buildForm() {
    var form = root.querySelector('[data-bg="form"]');
    var s = store();
    form.textContent = '';

    var head = el('div', 'bg-form__head');
    head.appendChild(el('p', 'bg-form__desc', current.beschreibung));
    var tLabel = el('label', 'bg-field__label', T.titleLabel);
    tLabel.setAttribute('for', 'bg-titel');
    var tInput = el('input', 'bg-input');
    tInput.id = 'bg-titel';
    tInput.type = 'text';
    tInput.value = s.__titel !== undefined ? s.__titel : current.titel;
    tInput.addEventListener('input', function () { s.__titel = tInput.value; });
    head.appendChild(tLabel);
    head.appendChild(tInput);
    form.appendChild(head);

    sections(current).forEach(function (a, i) {
      var fs = el('fieldset', 'bg-section');
      fs.appendChild(el('legend', 'bg-section__title', (i + 1) + '. ' + a.titel));
      a.felder.forEach(function (f) {
        var k = key(a, f);
        var id = 'bg-' + k.replace(/[^a-z0-9]/gi, '-');
        var wrap = el('div', 'bg-field');
        var label = el('label', 'bg-field__label', f.label);
        label.setAttribute('for', id);
        wrap.appendChild(label);
        if (f.frage) {
          var help = el('p', 'bg-field__help', f.frage);
          help.id = id + '-hilfe';
          wrap.appendChild(help);
        }
        var ta = el('textarea', 'bg-input bg-input--area');
        ta.id = id;
        ta.rows = 2;
        if (f.beispiel) ta.placeholder = T.examplePrefix + f.beispiel;
        if (f.frage) ta.setAttribute('aria-describedby', id + '-hilfe');
        ta.value = s[k] || '';
        ta.addEventListener('input', function () { s[k] = ta.value; updateStatus(); });
        wrap.appendChild(ta);
        fs.appendChild(wrap);
      });
      form.appendChild(fs);
    });
    updateStatus();
  }

  function counts() {
    var total = 0, filled = 0, s = store();
    sections(current).forEach(function (a) {
      a.felder.forEach(function (f) {
        total++;
        if ((s[key(a, f)] || '').trim()) filled++;
      });
    });
    return { total: total, filled: filled };
  }

  function updateStatus() {
    var c = counts();
    root.querySelector('[data-bg="status"]').textContent =
      T.status(c.filled, c.total);
  }

  // ---------- Ausgabe ----------
  function onlyFilled() {
    var cb = root.querySelector('#bg-nur-ausgefuellt');
    return cb && cb.checked;
  }

  function model() {
    var s = store();
    var skip = onlyFilled();
    var out = { titel: (s.__titel !== undefined ? s.__titel : current.titel).trim() || current.titel, abschnitte: [] };
    sections(current).forEach(function (a) {
      var felder = [];
      a.felder.forEach(function (f) {
        var v = (s[key(a, f)] || '').trim();
        if (skip && !v) return;
        felder.push({ label: f.label, wert: v, frage: f.frage });
      });
      if (felder.length) out.abschnitte.push({ titel: a.titel, felder: felder });
    });
    return out;
  }

  function markdown() {
    var m = model();
    var lines = ['# ' + m.titel, '', T.createdOn(today(), SITE_URL), ''];
    m.abschnitte.forEach(function (a, i) {
      lines.push('## ' + (i + 1) + '. ' + a.titel, '');
      a.felder.forEach(function (f) {
        if (f.wert) {
          lines.push('**' + f.label + ':** ' + f.wert.replace(/\n/g, '  \n'), '');
        } else {
          lines.push('**' + f.label + ':** ' + (f.frage ? '_' + f.frage + '_' : ''), '');
        }
      });
    });
    return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
  }

  function notify(text) {
    var n = root.querySelector('[data-bg="notice"]');
    n.textContent = text;
    clearTimeout(notify.t);
    notify.t = setTimeout(function () { n.textContent = ''; }, 4000);
  }

  function copy() {
    var text = markdown();
    var done = function () { notify(T.copied); };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else {
      fallback();
    }
    function fallback() {
      var ta = el('textarea', 'bg-offscreen');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); done(); }
      catch (e) { notify(T.copyFailed); }
      document.body.removeChild(ta);
    }
  }

  function download() {
    var blob = new Blob([markdown()], { type: 'text/markdown;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = el('a');
    a.href = url;
    a.download = slug(model().titel) + '.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    notify(T.saved);
  }

  function print() {
    var m = model();
    var view = document.getElementById('bg-print-root');
    if (!view) {
      view = el('div', 'bg-print-root');
      view.id = 'bg-print-root';
      document.body.appendChild(view);
    }
    view.textContent = '';
    var c = counts();

    var head = el('header', 'bg-print__head');
    var brand = el('div', 'bg-print__brand');
    brand.appendChild(el('span', 'bg-print__brand-name', 'Thorsten Litzki'));
    brand.appendChild(el('span', 'bg-print__brand-dot', '.'));
    brand.appendChild(el('span', 'bg-print__brand-tool', T.tool));
    head.appendChild(brand);
    head.appendChild(el('p', 'bg-print__type', current.name));
    head.appendChild(el('h1', 'bg-print__title', m.titel));
    var meta = el('dl', 'bg-print__meta');
    [[T.created, today()], [T.filled, T.progress(c.filled, c.total)], [T.approval, '']].forEach(function (pair) {
      var item = el('div', 'bg-print__meta-item');
      item.appendChild(el('dt', null, pair[0]));
      item.appendChild(el('dd', pair[1] ? null : 'bg-print__meta-blank', pair[1] || ' '));
      meta.appendChild(item);
    });
    head.appendChild(meta);
    view.appendChild(head);

    m.abschnitte.forEach(function (a, i) {
      var sec = el('section', 'bg-print__block');
      var h = el('h2', 'bg-print__section');
      h.appendChild(el('span', 'bg-print__num', String(i + 1).padStart(2, '0')));
      h.appendChild(document.createTextNode(a.titel));
      sec.appendChild(h);
      a.felder.forEach(function (f) {
        var p = el('div', 'bg-print__field' + (f.wert ? ' is-filled' : ''));
        p.appendChild(el('p', 'bg-print__label', f.label));
        if (f.wert) {
          p.appendChild(el('p', 'bg-print__value', f.wert));
        } else {
          if (f.frage) p.appendChild(el('p', 'bg-print__hint', f.frage));
          p.appendChild(el('div', 'bg-print__blank'));
          p.appendChild(el('div', 'bg-print__blank'));
        }
        sec.appendChild(p);
      });
      view.appendChild(sec);
    });

    var foot = el('footer', 'bg-print__foot');
    foot.appendChild(el('p', null, T.footer1(SITE_URL)));
    foot.appendChild(el('p', null, T.footer2));
    view.appendChild(foot);
    document.body.classList.add('bg-printing');
    window.print();
  }

  window.addEventListener('afterprint', function () {
    document.body.classList.remove('bg-printing');
  });

  // ---------- Ausfüllbares PDF (lädt pdf-lib erst bei Bedarf) ----------
  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      if (document.querySelector('script[src="' + src + '"]')) return resolve();
      var s = document.createElement('script');
      s.src = src; s.onload = resolve; s.onerror = function () { reject(new Error(src)); };
      document.head.appendChild(s);
    });
  }

  function fillablePdf() {
    var btn = root.querySelector('[data-bg="pdf"]');
    var label = btn.textContent;
    btn.disabled = true;
    btn.textContent = T.pdfBusy;
    loadScript(BASE + 'js/vendor/pdf-lib.min.js')
      .then(function () { return loadScript(BASE + 'js/vendor/fontkit.umd.min.js'); })
      .then(function () { return loadScript(BASE + 'js/briefing-pdf.js'); })
      .then(function () {
        var c = counts();
        return window.BriefingPDF.build(model(), {
          vorlage: current.name,
          datum: today(),
          fortschritt: T.progress(c.filled, c.total),
          lang: LANG,
          url: SITE_URL,
          fontBase: BASE + 'assets/fonts/pdf/'
        });
      })
      .then(function (bytes) {
        var blob = new Blob([bytes], { type: 'application/pdf' });
        var url = URL.createObjectURL(blob);
        var a = el('a');
        a.href = url;
        a.download = slug(model().titel) + '.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
        notify(T.pdfDone);
      })
      .catch(function () { notify(T.pdfFailed); })
      .then(function () { btn.disabled = false; btn.textContent = label; });
  }

  function reset() {
    if (!counts().filled && store().__titel === undefined) return;
    if (!window.confirm(T.resetConfirm)) return;
    values[current.id] = {};
    buildForm();
    notify(T.resetDone);
  }

  // Warnung, bevor ausgefüllte Eingaben durch Neuladen verloren gehen
  window.addEventListener('beforeunload', function (e) {
    var any = Object.keys(values).some(function (id) {
      return Object.keys(values[id]).some(function (k) {
        return k !== '__titel' && (values[id][k] || '').trim();
      });
    });
    if (any) { e.preventDefault(); e.returnValue = ''; }
  });

  // ---------- Start ----------
  root.querySelector('[data-bg="copy"]').addEventListener('click', copy);
  root.querySelector('[data-bg="download"]').addEventListener('click', download);
  root.querySelector('[data-bg="print"]').addEventListener('click', print);
  root.querySelector('[data-bg="pdf"]').addEventListener('click', fillablePdf);
  root.querySelector('[data-bg="reset"]').addEventListener('click', reset);

  fetch(DATA_URL, { credentials: 'same-origin' })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (json) {
      data = json;
      root.classList.add('is-ready');
      buildPicker();
      var wanted = (window.location.hash.match(/(?:vorlage|template)=([a-z0-9-]+)/) || [])[1];
      select(wanted && data.vorlagen.some(function (v) { return v.id === wanted; }) ? wanted : data.vorlagen[0].id, false);
    })
    .catch(function () {
      root.querySelector('[data-bg="form"]').textContent =
        T.loadFailed;
    });
})();
