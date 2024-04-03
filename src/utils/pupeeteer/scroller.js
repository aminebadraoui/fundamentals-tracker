function scrollToBottom({
    page,
    distancePx,
    speedMs,
    scrollTimeoutMs,
    eltToScroll,
  }) {
    return page.evaluate(
      (distancePx, speedMs, scrollTimeoutMs, eltToScroll) => {
        return new Promise((resolve) => {
          const elt = document.querySelector(eltToScroll);
          let totalHeight = 0;
          const timer = setInterval(() => {
            const scrollHeight = elt.scrollHeight;
            window.scrollBy(0, distancePx);
            totalHeight += distancePx;
  
            if (totalHeight >= scrollHeight) {
              clearInterval(timer);
              resolve();
            }
          }, speedMs);
  
          setTimeout(() => {
            clearInterval(timer);
            resolve();
          }, scrollTimeoutMs);
        });
      },
      distancePx,
      speedMs,
      scrollTimeoutMs,
      eltToScroll
    );
  }

  export { scrollToBottom }