# 使い方(ヘルプ)の文を理科用にする
import pathlib, re
p = pathlib.Path('src/template.html'); s = p.read_text(encoding='utf-8')
def line(tag, new):
    global s
    m = re.search(r'    <li><b>' + tag + r'</b>[^\n]*\n', s)
    assert m, tag
    s = s[:m.start()] + new + '\n' + s[m.end():]
line('小単元', '    <li><b>小単元</b> 単元の中の小単元(たとえば「電気の通り道」の「明かりがつくつなぎ方」)だけのプリントも作れます。メニューの単元の「小単元をえらぶ」から、または上の「小単元」でえらびます。</li>')
line('ヒントをつける', '    <li><b>ヒントをつける</b> ヒントがある問題だけ、問題の下に出します(理科プリントでは、まだヒントのある問題はほとんどありません)。</li>')
line('ふりがなをつける', '    <li><b>ふりがなをつける</b> プリントの漢字に、図や表の中もふくめて すべてふりがなをつけます。</li>')
p.write_text(s, encoding='utf-8')
print('ok')
