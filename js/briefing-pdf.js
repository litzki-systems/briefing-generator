/*
 * Briefing-Generator · ausfüllbares PDF
 * Erzeugt im Browser ein PDF-Formular: ausgefüllte Felder stehen fest im Dokument,
 * leere Felder werden zu Eingabefeldern (Acrobat, Vorschau, Chrome, Edge).
 * Wird erst beim Klick geladen. Benötigt /js/vendor/pdf-lib.min.js und fontkit.
 * Lizenz: MIT
 */
(function () {
  'use strict';

  var FONT_BASE = '/assets/fonts/pdf/';
  var A4 = [595.28, 841.89];
  var M = { top: 46, right: 45, bottom: 58, left: 45 };
  var W = A4[0] - M.left - M.right;

  function hex(h) {
    var n = parseInt(h.slice(1), 16);
    return PDFLib.rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
  }
  var C = {
    navy: '#0F1F3D', gold: '#C9A84C', goldDark: '#A88A35', goldBg: '#FBF7EE',
    text: '#1E293B', gray6: '#475569', gray5: '#64748B', gray3: '#CBD5E1', gray4: '#94A3B8', field: '#F8FAFC'
  };

  function load(url) {
    return fetch(url, { credentials: 'same-origin' }).then(function (r) {
      if (!r.ok) throw new Error('Laden fehlgeschlagen: ' + url);
      return r.arrayBuffer();
    });
  }

  // WinAnsi-sichere Fassung für Formularfelder (Helvetica)
  function ansi(s) {
    return String(s || '').replace(/[→]/g, '->').replace(/[^\u0000-ÿ–—‘’‚“”„…€]/g, '');
  }

  function wrap(text, font, size, width) {
    var out = [];
    String(text || '').split(/\n/).forEach(function (para) {
      var words = para.split(/\s+/).filter(Boolean);
      if (!words.length) { out.push(''); return; }
      var line = '';
      words.forEach(function (w) {
        var test = line ? line + ' ' + w : w;
        if (font.widthOfTextAtSize(test, size) <= width) { line = test; return; }
        if (line) out.push(line);
        // sehr lange Wörter hart umbrechen
        while (font.widthOfTextAtSize(w, size) > width) {
          var i = w.length;
          while (i > 1 && font.widthOfTextAtSize(w.slice(0, i), size) > width) i--;
          out.push(w.slice(0, i)); w = w.slice(i);
        }
        line = w;
      });
      out.push(line);
    });
    return out;
  }

  var L = {
    de: { tool: 'BRIEFING-GENERATOR', author: 'Briefing-Generator', created: 'ERSTELLT', filled: 'AUSGEFÜLLT', approval: 'FREIGABE', lang: 'de-DE',
      made: 'Erstellt mit dem kostenlosen Briefing-Generator: ',
      local: 'Alle Eingaben wurden nur im Browser verarbeitet. Leere Felder können direkt in diesem PDF ausgefüllt werden.',
      page: function (i, n) { return 'Seite ' + i + ' von ' + n; }, url: 'thorsten-litzki.de/briefing-aufbau-erstellen', field: 'feld_' },
    en: { tool: 'BRIEFING GENERATOR', author: 'Briefing Generator', created: 'CREATED', filled: 'FILLED IN', approval: 'SIGN-OFF', lang: 'en-US',
      made: 'Created with the free Briefing Generator: ',
      local: 'All input was processed in the browser only. Empty fields can be filled in directly in this PDF.',
      page: function (i, n) { return 'Page ' + i + ' of ' + n; }, url: 'thorsten-litzki.de/en/blog/creating-a-briefing-structure', field: 'field_' }
  };

  function build(model, info) {
    var t = L[info.lang === 'en' ? 'en' : 'de'];
    var site = info.url || t.url;
    var fontBase = info.fontBase || FONT_BASE;
    var doc, F = {}, page, y, form, fieldNo = 0, pages = [];

    function newPage() {
      page = doc.addPage(A4);
      pages.push(page);
      y = A4[1] - M.top;
    }
    function ensure(h) { if (y - h < M.bottom) newPage(); }
    function text(t, x, size, font, color, opts) {
      page.drawText(t, Object.assign({ x: x, y: y, size: size, font: font, color: hex(color) }, opts || {}));
    }
    function lines(arr, x, size, font, color, lead) {
      arr.forEach(function (l) { y -= lead; text(l, x, size, font, color); });
    }
    function rule(thick, color, x1, x2) {
      page.drawLine({ start: { x: x1 || M.left, y: y }, end: { x: x2 || (M.left + W), y: y }, thickness: thick, color: hex(color) });
    }
    function textField(name, x, top, w, h, value) {
      var f = form.createTextField(name);
      if (value) f.setText(ansi(value));
      f.enableMultiline();
      f.addToPage(page, {
        x: x, y: top - h, width: w, height: h,
        textColor: hex(C.text), backgroundColor: hex(C.field),
        borderColor: hex(C.gray3), borderWidth: 0.75, font: F.field
      });
      f.setFontSize(10);
      return f;
    }

    return PDFLib.PDFDocument.create().then(function (d) {
      doc = d;
      doc.registerFontkit(window.fontkit);
      doc.setTitle(ansi(model.titel));
      doc.setAuthor(t.author + ' · ' + site.split('/')[0]);
      doc.setSubject(info.vorlage);
      doc.setCreator(site);
      doc.setLanguage(t.lang);
      return Promise.all([
        load(fontBase + 'inter-latin-400-normal.woff'),
        load(fontBase + 'inter-latin-700-normal.woff'),
        load(fontBase + 'inter-latin-400-italic.woff'),
        load(fontBase + 'eb-garamond-latin-600-normal.woff')
      ]);
    }).then(function (buf) {
      return Promise.all([
        doc.embedFont(buf[0], { subset: true }),
        doc.embedFont(buf[1], { subset: true }),
        doc.embedFont(buf[2], { subset: true }),
        doc.embedFont(buf[3], { subset: true }),
        doc.embedFont(PDFLib.StandardFonts.Helvetica)
      ]);
    }).then(function (f) {
      F = { reg: f[0], bold: f[1], ital: f[2], serif: f[3], field: f[4] };
      form = doc.getForm();
      newPage();

      // ---------- Kopf ----------
      y -= 13;
      text('Thorsten Litzki', M.left, 13, F.serif, C.navy);
      text('.', M.left + F.serif.widthOfTextAtSize('Thorsten Litzki', 13), 13, F.serif, C.gold);
      var tool = t.tool;
      text(tool, M.left + W - F.reg.widthOfTextAtSize(tool, 9.5), 9.5, F.reg, C.gray5);
      y -= 24;
      text(info.vorlage.toUpperCase(), M.left, 9, F.bold, C.goldDark);
      y -= 4;
      lines(wrap(model.titel, F.serif, 21, W), M.left, 21, F.serif, C.navy, 24);
      y -= 20;
      var colW = W / 3;
      [[t.created, info.datum], [t.filled, info.fortschritt], [t.approval, null]].forEach(function (m, i) {
        var x = M.left + i * colW;
        page.drawText(m[0], { x: x, y: y, size: 9.5, font: F.reg, color: hex(C.gray5) });
        if (m[1]) page.drawText(m[1], { x: x, y: y - 14, size: 10, font: F.bold, color: hex(C.navy) });
      });
      var fr = form.createTextField('freigabe');
      fr.addToPage(page, { x: M.left + 2 * colW, y: y - 18, width: colW, height: 15, font: F.field, textColor: hex(C.text), backgroundColor: hex(C.field), borderColor: hex(C.gray4), borderWidth: 0.5 });
      fr.setFontSize(10);
      y -= 30;
      rule(2, C.navy);
      y -= 20;

      // ---------- Abschnitte ----------
      model.abschnitte.forEach(function (a, i) {
        ensure(80);
        y -= 14;
        var num = String(i + 1).padStart(2, '0');
        text(num, M.left, 9.5, F.bold, C.goldDark);
        text(a.titel, M.left + 20, 14, F.serif, C.navy);
        y -= 6;
        rule(0.75, C.gray3);
        y -= 6;

        a.felder.forEach(function (fd) {
          var labelLines = wrap(fd.label, F.bold, 10, W);
          if (fd.wert) {
            var vLines = wrap(fd.wert, F.reg, 10, W - 18);
            var boxH = vLines.length * 13.5 + 10;
            ensure(labelLines.length * 13 + boxH + 14);
            lines(labelLines, M.left, 10, F.bold, C.navy, 13);
            y -= 6;
            page.drawRectangle({ x: M.left, y: y - boxH, width: W, height: boxH, color: hex(C.goldBg) });
            page.drawRectangle({ x: M.left, y: y - boxH, width: 2.5, height: boxH, color: hex(C.gold) });
            y -= 3;
            lines(vLines, M.left + 11, 10, F.reg, C.text, 13.5);
            y -= 7 + 10;
          } else {
            var hLines = fd.frage ? wrap(fd.frage, F.ital, 9.5, W) : [];
            var fh = 44;
            ensure(labelLines.length * 13 + hLines.length * 12.5 + fh + 16);
            lines(labelLines, M.left, 10, F.bold, C.navy, 13);
            lines(hLines, M.left, 9.5, F.ital, C.gray6, 12.5);
            y -= 6;
            fieldNo++;
            textField(t.field + String(fieldNo).padStart(3, '0') + '_' + ansi(fd.label).replace(/[^A-Za-z0-9]+/g, '_').slice(0, 30), M.left, y, W, fh);
            y -= fh + 12;
          }
        });
        y -= 6;
      });

      // ---------- Abschluss ----------
      ensure(40);
      y -= 6;
      rule(0.75, C.gray3);
      y -= 14;
      text(t.made + site, M.left, 9.5, F.reg, C.gray5);
      y -= 12;
      text(t.local, M.left, 9.5, F.reg, C.gray5);

      // ---------- Fußzeilen ----------
      pages.forEach(function (p, i) {
        var right = t.page(i + 1, pages.length);
        p.drawText(site, { x: M.left, y: 30, size: 9.5, font: F.reg, color: hex(C.gray5) });
        p.drawText(right, { x: M.left + W - F.reg.widthOfTextAtSize(right, 9.5), y: 30, size: 9.5, font: F.reg, color: hex(C.gray5) });
      });

      form.updateFieldAppearances(F.field);
      return doc.save();
    });
  }

  window.BriefingPDF = { build: build };
})();
