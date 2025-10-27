describe('Offline Page UI', () => {
  let document;

  beforeEach(() => {
    document = window.document;
    document.body.innerHTML = require('fs').readFileSync('offline.html', 'utf8');
  });

  test('renders offline message', () => {
    const heading = document.querySelector('h1');
    expect(heading).not.toBeNull();
    expect(heading.textContent.toLowerCase()).toContain('offline');
  });

  test('retry button exists', () => {
    const button = document.querySelector('button');
    expect(button).not.toBeNull();
    expect(button.textContent.toLowerCase()).toContain('retry');
  });

  test('retry button reloads the page', () => {
    const button = document.querySelector('button');
    const reloadMock = jest.fn();
    window.location.reload = reloadMock;
    button.click();
    expect(reloadMock).toHaveBeenCalled();
  });
});