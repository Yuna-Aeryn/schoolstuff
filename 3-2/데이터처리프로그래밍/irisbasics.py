import pandas as pd
df = pd.DataFrame({'상품' : ['시계', '반지', '반지', '목걸이', '팔찌'],
'재질' : ['금', '은', '백금', '금', '은'],
'가격': [500000, 20000, 350000, 300000, 60000]})


new_df = df.pivot(index='상품', columns='재질', values='가격')
print(new_df.fillna(value=0))