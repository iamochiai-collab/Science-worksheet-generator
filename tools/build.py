"""理科プリントを 1つの HTML にまとめる。

  python3 tools/build.py          → docs/index.html(公開用)と build/test.html(テスト用)

src/template.html に、次のものを入れて 1 ファイルにする。
  - src/generators/<名前>/*.js   問題をつくる部品(ファイル名の順につなぐ)
  - src/generators/<名前>/topics.json があれば、その単元の topics をおきかえる
  - assets/chara/*.webp           キャラクター画像({{CHARA:名前}} の場所に data URI で入る)
  - assets/money/*.webp           お金の絵({{MONEY:名前}} の場所に data URI で入る)
  - assets/icon/*.png             サイトのアイコン({{ICON:名前}} の場所に data URI で入る)
  - vendor/*.js                   PDF・JPG・zip 用の道具({{VENDOR:ファイル名}} の場所に入る)
"""
import base64, json, re, pathlib

root = pathlib.Path(__file__).resolve().parent.parent
s = (root / 'src' / 'template.html').read_text(encoding='utf-8')

# --- 問題をつくる部品 ---
gen_root = root / 'src' / 'generators'
groups = sorted(d for d in gen_root.iterdir() if d.is_dir())
code, names = '', []
for d in groups:
    src = ''.join(f.read_text(encoding='utf-8') for f in sorted(d.glob('*.js')))
    code += f'\n  // add/{d.name}\n' + ''.join('  ' + l if l.strip() else l for l in src.splitlines(True))
    names.append(d.name)
marker = '  var list = [\n'
assert s.count(marker) == 1
s = s.replace(marker, code + '\n' + marker)
reg = '  var generators = Object.fromEntries(list.map((g3) => [g3.id, g3]));'
assert s.count(reg) == 1
s = s.replace(reg, f'  list.push({", ".join("..." + n for n in names)});\n' + reg)

# --- 単元の topics のおきかえ ---
for d in groups:
    tj = d / 'topics.json'
    if not tj.exists():
        continue
    for unit_id, topics in json.loads(tj.read_text(encoding='utf-8')).items():
        m = re.search(r'\n(\s*)id: "%s",' % re.escape(unit_id), s)
        assert m, unit_id
        a = s.index('topics: [', m.end())
        i, depth = a + len('topics: '), 0
        while True:
            c = s[i]
            if c == '[':
                depth += 1
            elif c == ']':
                depth -= 1
                if depth == 0:
                    break
            i += 1
        ind = m.group(1)
        body = ',\n'.join(ind + '  ' + json.dumps(t, ensure_ascii=False) for t in topics)
        s = s[:a] + 'topics: [\n' + body + '\n' + ind + ']' + s[i + 1:]

# --- キャラクター画像と道具 ---
def chara(m):
    data = (root / 'assets' / 'chara' / f'{m.group(1)}.webp').read_bytes()
    return 'data:image/webp;base64,' + base64.b64encode(data).decode()
s = re.sub(r'\{\{CHARA:(\w+)\}\}', chara, s)
# サイトのアイコン({{ICON:名前}} に assets/icon/名前.png)
s = re.sub(r'\{\{ICON:(\w+)\}\}', lambda m: 'data:image/png;base64,' + base64.b64encode((root / 'assets' / 'icon' / f'{m.group(1)}.png').read_bytes()).decode(), s)
# お金の絵({{MONEY:名前}} に assets/money/名前.webp)
# お金の絵は理科ではつかわない(算数のコードの名残り)
s = re.sub(r'\{\{MONEY:(\w+)\}\}', '', s)
# 理科のイラスト・図(assets/pic・assets/fig)を、名前 → [data URI, はば, 高さ] の表にして /*PICMAP*/{} に入れる
from PIL import Image as _Image
_pm = {}
for _d in ['pic', 'fig']:
    for _f in sorted((root / 'assets' / _d).glob('*.webp')):
        _w, _h = _Image.open(_f).size
        _pm[_f.stem] = ['data:image/webp;base64,' + base64.b64encode(_f.read_bytes()).decode(), _w, _h]
assert s.count('/*PICMAP*/{}') == 1
s = s.replace('/*PICMAP*/{}', json.dumps(_pm))
s = re.sub(r'\{\{VENDOR:([\w.\-]+)\}\}', lambda m: (root / 'vendor' / m.group(1)).read_text(encoding='utf-8'), s)
assert '{{CHARA:' not in s and '{{VENDOR:' not in s and '{{MONEY:' not in s and '{{ICON:' not in s

(root / 'docs').mkdir(exist_ok=True)
# 公開ページ用に、アイコンをファイルとしても置く(iPhone・iPad のホーム画面用)
import shutil
shutil.copyfile(root / 'assets' / 'icon' / 'icon180.png', root / 'docs' / 'apple-touch-icon.png')
shutil.copyfile(root / 'assets' / 'icon' / 'icon32.png', root / 'docs' / 'favicon.png')
shutil.copyfile(root / 'assets' / 'icon' / 'ogp.jpg', root / 'docs' / 'ogp.jpg')
(root / 'docs' / 'index.html').write_text(s, encoding='utf-8')
hook = '  window.__T = { generators, GRADES, buildSheet, makeRng, topicParams, getGenerator, kanji_default, renderText, makeKanjiPolicy, sheetHtml, paginate, ansify, HINTS, topicRuby, topicKinds, filledSheet, pageFill };\n})();\n\n</script>'
end = '})();\n\n</script>'
assert s.count(end) == 1
(root / 'build').mkdir(exist_ok=True)
(root / 'build' / 'test.html').write_text(s.replace(end, hook), encoding='utf-8')
print(f'built docs/index.html ({len(s.encode()) / 1e6:.2f} MB) with', ', '.join(names))
