const performClickAction = async (page, element, offsetX, offsetY) => {
  await page.waitForSelector(element, {
      visible: true,
  });
  await page.locator(element)
  .click({
      offset: {
          x: offsetX,
          y: offsetY,
      },
  });
}

export { performClickAction }