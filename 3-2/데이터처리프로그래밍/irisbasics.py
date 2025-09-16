import pandas as pd
import seaborn as sns
iris = sns.load_dataset("iris")



new_iris = iris.drop(2, axis=0)
new_iris = iris.drop([1, 2])
new_iris.head()