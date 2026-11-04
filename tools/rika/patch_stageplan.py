# 理科プリント:特別支援の段階の単元が1つの単元からできているときは、まとめテストの組み立て(testPlan)もうけつぐ。1回だけ使う
import pathlib
p = pathlib.Path('src/template.html'); s = p.read_text(encoding='utf-8')
a = '''          else if (!no && su.from.length === 1 && src.starts) props = { starts: src.starts };
        }'''
b = '''          else if (!no && su.from.length === 1 && src.starts) props = { starts: src.starts };
          if (!no && su.from.length === 1 && src.testPlan) props = { ...props, testPlan: src.testPlan };
        }'''
assert s.count(a) == 1
s = s.replace(a, b)
p.write_text(s, encoding='utf-8')
print('ok')
