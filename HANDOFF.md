# 引き継ぎメモ(ほかの会話で続きをするとき)

この会話をはじめたら、まずこのファイルを読んでください。作っている人は 落合聡一(小学校・特別支援学校の先生)。返事はやさしい日本語で、短めに。

## 1. これは何か
- 1ファイルで動く理科プリントのアプリ「理科プリント」(第1版 2026-11-04)。算数プリント(iamochiai-collab/Math-worksheet-generator)の template をもとに作った
- GitHub: `iamochiai-collab/Science-worksheet-generator`(main)。公開は Settings → Pages → main の `/docs`
- ポータル「メガネプリント教材庫」(iamochiai-collab/megane-print)の 理科 から リンクしている

## 2. しくみ
- 問題は `content/*.js` にふつうの日本語で書く → `node tools/rika/annotate.js` で ふりがなをつけて `src/generators/<名前>/part1.js` へ → `python3 tools/build.py`
  - `content/r0lib.js` … 共通の道具 `RK`(bank:ことばの問題、figs:図の問題、calc:計算、grade:学年のデータ、fig/T/line…:図をかく道具)
  - `content/r0lib2.js` … 共通の図 `RD`(かん電池・豆電球・回路記号・じしゃく・方位じしん・温度計・メスシリンダー・ビーカー・アルコールランプ・ガスバーナー・こん虫・植物・月の形)
  - `content/r1sei.js`(小1・2 生活)、`r3`〜`r6`(小3〜6)、`r7chu1`・`r8chu2`・`r9chu3`(中1〜3)、`rzstage.js`(特別支援の段階 `tokushiStages`)
- 問題の書き方(bank): 1行1問 `むずかしさ|問い|答え`。`（　　　）` は答えの四角になる。`=正しい|ちがう|ちがう` はえらぶ問題、`>1番目|2番目|…` はならべる問題
  - `2|〜（　　　）〜（　　　）〜|答え1|答え2|-まぎらわしいことば` は〔ことば〕からえらぶ穴うめ、`1|?文|○` は○×、`2|!指示文|もの=○|もの=×|…` はいくつかに○×をつける問題
  - `content/rsum.js` … 単元ごとの「まとめ(ことばをえらぶ・○×)」。各単元の小単元のさいごに足している
  - `content/rmore.js` … まとめにくわえる ○× (`rmoreTf`)。`RK.bank` は「〜を何といいますか。|A」などから ○× の文を自動で作る(`deriveTf`。まちがいの文は FAM のなかまのことば)。作った ○× は、もとの問題と同じ key(同じプリントに出ない)
  - `content/rfig.js` … 図のなかった単元の図・表・絵の問題と、実験の考え方の問題。`RK.addTopic(単元, 名前, 部品, "f")` で単元に足す(はじめての図なら、テストは図1問30点)
  - `content/rorder.js` … 教科書会社の単元の順(`PUB_ORDER`)。メニューの「教科書の順」(`tools/rika/patch_pub.py`)。えらんだものは localStorage の `rika-print:pub`
  - 文で書いて答える問題(なぜ・1つ答えましょう など)の答えには、自動で「(例)」がつく(`exAns`)
- イラスト:`assets/pic/*.webp`(4×4のイラスト集を切り分けた128こ。名前は asagao・monshiro・g_cho1 など)と `assets/fig/*.webp`(scope・burner・lamp・tenbin・aburana・arm・insect・nekukiha)。build で `/*PICMAP*/{}` に 名前→[data URI, はば, 高さ] が入る
  - 問題のよこの絵は `r0lib.js` の `PICS`(問いのことば→絵の名前)。イラストにない名前は絵文字のまま出る
  - `RK.labeled(名前, はばmm, [[x, y, "L"か"R", 記号], …])` … 図に ア・イ… と引き出し線をつける(x, y は assets/fig の画像の点)
  - `RK.picRow([名前, …])` … 絵をならべて下に ア・イ… をつける(じゅんばん・えらぶ問題)
- 練習プリント(kind `practice`):`RK.practicePlan(level, kids)` の順に、bank の問題を形(`cat`:bank・tf・tfl・pick・why・word)でしぼって作る。template の buildSheet の `kind === "practice"`(`tools/rika/patch_practice.py`)
- 図の中の SVG に日本語を直接書かない(ふりがなの記法が入るため)。ことばは `T(x, y, ことば)` で書く
- 文の中に「□」を書かない(答えの四角になってしまう)
- 読みのまちがい(例:日かげ、金星)は `tools/rika/yomi.txt` に `ことば=かきかた` で足す。`tools/rika/yomi-report.txt` に自動でつけた読みの一覧が出る
- template.html の理科用の変更は `tools/rika/patch_template.py` にまとめてある(算数の template を新しくしたときにもう一度あてる)

## 3. 検査(変えたら必ず)
```sh
node tools/rika/annotate.js && python3 tools/build.py
node tools/rika/check.js build/test.html 150          # problems 0 になること
node tools/test/layout.js docs/index.html 結果.json 1,2,3,4,5   # fails 0・overflow 0
node tools/test/layout.js docs/index.html 結果.json 6,7,8,9
node tools/test/layout.js docs/index.html 結果.json 21,22,23,24,25,26,27
node tools/test/firstopen.js docs/index.html
```

## 4. 先生の希望(算数プリントと同じ)
- 1ページの形はすらすらぷりんと風。問題は少なめ・大きめ
- 特別支援: 段階名をプリントに書かない
- 前の版は消さない(大きく変えるときはブランチで保存)

## 5. まだやっていないこと(案)
- 図の問題をふやす(人の体の図、天気図、星座 など)
- 生活科の内容をふやす(じぶんの せいちょう、きせつの あそび など)
- 教科書会社ごとの単元の順
