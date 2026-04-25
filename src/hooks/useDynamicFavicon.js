import { useEffect, useRef } from 'react';

/**
 * Dynamic Favicon — changes the browser tab icon based on app state.
 * Shows a green dot when the Shadow Mentor has a new suggestion.
 */
export default function useDynamicFavicon(hasMentorNotification = false) {
  const canvasRef = useRef(document.createElement('canvas'));

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, 32, 32);

    // Cross-browser rounded rect (roundRect not available in all browsers)
    const r = 6, x = 0, y = 0, w = 32, h = 32;
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();

    // "D" letter
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('D', 16, 17);

    // Green notification dot
    if (hasMentorNotification) {
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(26, 6, 5, 0, Math.PI * 2);
      ctx.fill();
      // Inner ring for visibility
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(26, 6, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = canvas.toDataURL('image/png');
  }, [hasMentorNotification]);
}
