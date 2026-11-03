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
