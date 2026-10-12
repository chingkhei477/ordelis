/* Ordelis — site behaviour (no cookies, no tracking) */
(function () {
  'use strict';
  var doc = document;
  doc.documentElement.classList.add('js');

  /* Mobile navigation */
  var toggle = doc.querySelector('.nav-toggle');
  var nav = doc.getElementById('site-nav');
  if (toggle && nav) {
    var setOpen = function (open) {
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      nav.classList.toggle('is-open', open);
      toggle.querySelector('.nav-toggle-label').textContent = open ? 'Close' : 'Menu';
    };
    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });
    doc.addEventListener('click', function (e) {
      if (toggle.getAttribute('aria-expanded') === 'true' && !nav.contains(e.target) && !toggle.contains(e.target)) {
        setOpen(false);
      }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 860) { setOpen(false); }
    });
  }

  /* Offers page */
  var offerGrid = doc.getElementById('offer-grid');
  if (offerGrid) { renderOffers(offerGrid); }

  function el(tag, cls, text) {
    var n = doc.createElement(tag);
    if (cls) { n.className = cls; }
    if (text) { n.textContent = text; }
    return n;
  }

  function safeUrl(u) {
    try {
      var url = new URL(u, window.location.href);
      return url.protocol === 'https:' ? url.href : null;
    } catch (e) { return null; }
  }

  function renderOffers(grid) {
    var all = (window.ORDELIS_OFFERS || []).filter(function (o) {
      return o && o.store && o.cashback && safeUrl(o.link);
    });
    var empty = doc.getElementById('offers-empty');
    var tools = doc.getElementById('offer-filters');
    if (!all.length) {
      if (empty) { empty.hidden = false; }
      return;
    }
    if (empty) { empty.hidden = true; }

    var cats = [];
    all.forEach(function (o) { if (o.category && cats.indexOf(o.category) === -1) { cats.push(o.category); } });
    cats.sort();

    function draw(cat) {
      grid.textContent = '';
      all.filter(function (o) { return !cat || o.category === cat; }).forEach(function (o) {
        var card = el('article', 'card offer-card');
        if (o.category) { card.appendChild(el('p', 'offer-cat mb-0', o.category)); }
        card.appendChild(el('h3', 'mb-0', o.store));
        card.appendChild(el('p', 'offer-rate mb-0', o.cashback));
        if (o.terms) { card.appendChild(el('p', 'offer-terms', o.terms)); }
        if (o.verified) { card.appendChild(el('p', 'offer-meta mb-0', 'Rate last checked: ' + o.verified)); }
        var a = el('a', 'btn btn-primary', 'Shop via Ordelis');
        a.href = safeUrl(o.link);
        a.target = '_blank';
        a.rel = 'sponsored noopener noreferrer';
        a.setAttribute('aria-label', 'Shop at ' + o.store + ' via Ordelis (opens in a new tab)');
        card.appendChild(a);
        grid.appendChild(card);
      });
    }

    if (tools && cats.length > 1) {
      tools.hidden = false;
      var buttons = [];
      var make = function (label, value) {
        var b = el('button', 'filter-btn', label);
        b.type = 'button';
        b.setAttribute('aria-pressed', value === '' ? 'true' : 'false');
        b.addEventListener('click', function () {
          buttons.forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
          b.setAttribute('aria-pressed', 'true');
          draw(value);
        });
        buttons.push(b);
        tools.appendChild(b);
      };
      make('All', '');
      cats.forEach(function (c) { make(c, c); });
    }
    draw('');
  }

  /* Contact form: validates, then opens the visitor's email app with the message ready to send */
  var form = doc.getElementById('contact-form');
  if (form) {
    var status = doc.getElementById('form-status');
    var to = form.getAttribute('data-to');
    var lastMessage = '';

    var fields = {
      name: { el: form.elements.name, msg: 'Please enter your name.' },
      email: { el: form.elements.email, msg: 'Please enter a valid email address.' },
      topic: { el: form.elements.topic, msg: 'Please choose a topic.' },
      message: { el: form.elements.message, msg: 'Please write a message of at least 10 characters.' },
      consent: { el: form.elements.consent, msg: 'Please confirm so we can reply to you.' }
    };

    var validate = function (key) {
      var f = fields[key];
      var input = f.el;
      var ok;
      if (key === 'email') { ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim()); }
      else if (key === 'message') { ok = input.value.trim().length >= 10; }
      else if (key === 'consent') { ok = input.checked; }
      else { ok = input.value.trim().length > 0; }
      var err = doc.getElementById(input.id + '-error');
      input.setAttribute('aria-invalid', ok ? 'false' : 'true');
      if (err) { err.textContent = ok ? '' : f.msg; }
      return ok;
    };

    Object.keys(fields).forEach(function (k) {
      var evt = k === 'consent' || k === 'topic' ? 'change' : 'blur';
      fields[k].el.addEventListener(evt, function () { validate(k); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstBad = null;
      Object.keys(fields).forEach(function (k) {
        if (!validate(k) && !firstBad) { firstBad = fields[k].el; }
      });
      if (firstBad) { firstBad.focus(); return; }

      var name = fields.name.el.value.trim();
      var email = fields.email.el.value.trim();
      var topic = fields.topic.el.value;
      var order = (form.elements.order.value || '').trim();
      var body = 'Name: ' + name + '\nEmail: ' + email + '\nTopic: ' + topic +
        (order ? '\nStore / order ID: ' + order : '') + '\n\n' + fields.message.el.value.trim();
      var subject = 'Ordelis enquiry: ' + topic;
      lastMessage = 'To: ' + to + '\nSubject: ' + subject + '\n\n' + body;

      window.location.href = 'mailto:' + to + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      status.hidden = false;
      status.focus();
    });

    var copyBtn = doc.getElementById('copy-message');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        var done = function () { copyBtn.textContent = 'Copied'; setTimeout(function () { copyBtn.textContent = 'Copy message'; }, 2000); };
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(lastMessage).then(done, fallback);
        } else { fallback(); }
        function fallback() {
          var t = doc.createElement('textarea');
          t.value = lastMessage; t.setAttribute('readonly', '');
          t.style.position = 'fixed'; t.style.opacity = '0';
          doc.body.appendChild(t); t.select();
          try { doc.execCommand('copy'); done(); } catch (err) { /* ignore */ }
          doc.body.removeChild(t);
        }
      });
    }
  }
})();
