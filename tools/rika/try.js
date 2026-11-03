const kuromoji = require('kuromoji');
kuromoji.builder({ dicPath: 'node_modules/kuromoji/dict' }).build((err, tk) => {
  for (const s of process.argv.slice(2)) console.log(tk.tokenize(s).map(t => `${t.surface_form}/${t.reading||''}`).join(' '));
});
