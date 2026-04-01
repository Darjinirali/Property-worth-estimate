import pickle, numpy as np, pandas as pd, math

model   = pickle.load(open('model/xgb_model.pkl', 'rb'))
pt_dict = pickle.load(open('model/power_transformers.pkl', 'rb'))
feat    = pickle.load(open('model/feature_names.pkl', 'rb'))
le      = pickle.load(open('model/label_encoders.pkl', 'rb'))

print("PT dict keys:", list(pt_dict.keys()))
print("Total PT keys:", len(pt_dict))


