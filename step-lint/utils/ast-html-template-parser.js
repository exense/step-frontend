const templateCode = `
        @for (dashlet of dashboard.dashlets; let i = $index; track dashlet.id) {
        <div></div>
        }
`;

async function main() {
  const { parseTemplate } = await import('@angular/compiler');

  const ast = parseTemplate(templateCode, 'test-component.html', { preserveWhitespaces: true });
  console.dir(ast, { depth: 5 });
}

main();
