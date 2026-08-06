let hotspotCount = 0;

/**
 * Add one clickable hotspot + popup to the diagram.
 * @param {number} x - pixel X position (dot center)
 * @param {number} y - pixel Y position (dot center)
 * @param {string} heading - popup heading text
 * @param {string} body - popup body text
 */
function makePopup(x, y, heading, body) {
  hotspotCount++;
  const id = hotspotCount;
  const diagram = document.getElementById('diagram');

  const hotspot = document.createElement('div');
  hotspot.className = 'hotspot';
  hotspot.id = 'spot-' + id;
  hotspot.style.top = y + 'px';
  hotspot.style.left = x + 'px';

  const popup = document.createElement('div');
  popup.className = 'popup';
  popup.id = 'popup-' + id;
  popup.style.top = (y + 14) + 'px';   // small gap below the dot
  popup.style.left = x + 'px';          // top-left corner aligned to the dot
  popup.innerHTML =
    '<span class="close-btn">&times;</span>' +
    '<h3>' + heading + '</h3>' +
    '<p>' + body + '</p>';

  hotspot.addEventListener('click', function (e) {
    e.stopPropagation();
    togglePopup(popup, hotspot);
  });
  popup.querySelector('.close-btn').addEventListener('click', function (e) {
    e.stopPropagation();
    togglePopup(popup, hotspot);
  });

  diagram.appendChild(hotspot);
  diagram.appendChild(popup);
}

function togglePopup(popup, hotspot) {
  document.querySelectorAll('.popup').forEach(function (p) {
    if (p !== popup) p.classList.remove('active');
  });
  document.querySelectorAll('.hotspot').forEach(function (h) {
    if (h !== hotspot) h.classList.remove('open');
  });
  popup.classList.toggle('active');
  hotspot.classList.toggle('open', popup.classList.contains('active'));
}

// click anywhere outside a hotspot/popup closes all popups
document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('diagram').addEventListener('click', function (e) {
    if (!e.target.closest('.hotspot') && !e.target.closest('.popup')) {
      document.querySelectorAll('.popup').forEach(function (p) { p.classList.remove('active'); });
      document.querySelectorAll('.hotspot').forEach(function (h) { h.classList.remove('open'); });
    }
  });
});
